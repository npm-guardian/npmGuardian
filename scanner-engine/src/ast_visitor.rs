use swc_common::{sync::Lrc, FilePathMapping, SourceMap, errors::{Handler, ColorConfig}};
use swc_ecma_parser::{lexer::Lexer, Parser, StringInput, Syntax};
use swc_ecma_ast::*;
use swc_ecma_visit::{Visit, VisitWith};
use serde::Serialize;
use std::path::Path;

#[derive(Serialize, Debug, Clone)]
pub struct Finding {
    pub severity: String,
    pub category: String,
    pub description: String,
    pub file_path: String,
    pub line_number: usize,
}

pub struct SecurityVisitor {
    findings: Vec<Finding>,
    source_map: Lrc<SourceMap>,
    file_path: String,
}

impl Visit for SecurityVisitor {
    fn visit_call_expr(&mut self, n: &CallExpr) {
        if let Callee::Expr(expr) = &n.callee {
            if let Expr::Ident(ident) = &**expr {
                let name = ident.sym.to_string();
                if name == "eval" || name == "Function" {
                    let loc = self.source_map.lookup_char_pos(n.span.lo);
                    self.findings.push(Finding {
                        severity: "high".to_string(),
                        category: "Static Analysis".to_string(),
                        description: format!("Dangerous sink usage: {}()", name),
                        file_path: self.file_path.clone(),
                        line_number: loc.line,
                    });
                }
            } else if let Expr::Member(member) = &**expr {
                // Check for child_process.exec
                if let Expr::Ident(obj) = &*member.obj {
                    if obj.sym.to_string() == "child_process" {
                        if let MemberProp::Ident(prop) = &member.prop {
                            if prop.sym.to_string() == "exec" || prop.sym.to_string() == "spawn" {
                                let loc = self.source_map.lookup_char_pos(n.span.lo);
                                self.findings.push(Finding {
                                    severity: "critical".to_string(),
                                    category: "Static Analysis".to_string(),
                                    description: format!("Shell execution detected: child_process.{}()", prop.sym),
                                    file_path: self.file_path.clone(),
                                    line_number: loc.line,
                                });
                            }
                        }
                    }
                }
            }
        }
        n.visit_children_with(self);
    }
}

pub fn scan_file(file_path: &str, content: &str) -> Vec<Finding> {
    let cm: Lrc<SourceMap> = Default::default();
    let handler = Handler::with_tty_emitter(ColorConfig::Auto, true, false, Some(cm.clone()));

    let fm = cm.new_source_file(swc_common::FileName::Custom(file_path.into()), content.into());
    let lexer = Lexer::new(
        Syntax::Es(Default::default()),
        Default::default(),
        StringInput::from(&*fm),
        None,
    );

    let mut parser = Parser::new_from(lexer);

    for e in parser.take_errors() {
        e.into_diagnostic(&handler).emit();
    }

    match parser.parse_module() {
        Ok(module) => {
            let mut visitor = SecurityVisitor {
                findings: Vec::new(),
                source_map: cm,
                file_path: file_path.to_string(),
            };
            module.visit_with(&mut visitor);
            visitor.findings
        }
        Err(err) => {
            err.into_diagnostic(&handler).emit();
            Vec::new() // Return empty findings if parsing fails
        }
    }
}
