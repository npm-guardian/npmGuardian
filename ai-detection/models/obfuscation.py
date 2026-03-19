import math
from collections import Counter

def calculate_shannon_entropy(data: str) -> float:
    """
    Calculates the Shannon entropy of a given string.
    High entropy usually indicates encrypted, packed, or base64 encoded strings
    which is a major Indicator of Compromise (IoC) in npm malware.
    """
    if not data:
        return 0.0

    entropy = 0.0
    length = len(data)
    occurrences = Counter(data)

    for count in occurrences.values():
        probability = count / length
        entropy -= probability * math.log2(probability)

    return entropy

def detect_obfuscation(code_snippet: str) -> dict:
    """
    Analyzes a snippet of JS code and determines the likelihood of obfuscation.
    """
    entropy = calculate_shannon_entropy(code_snippet)
    
    # Typical English text / JS code has an entropy of ~3.5 to 5.0
    # Base64 or encrypted payloads often hit > 5.8
    risk_level = "LOW"
    score = 0
    
    if entropy > 5.8:
        risk_level = "HIGH"
        score = 85
    elif entropy > 5.0:
        risk_level = "MEDIUM"
        score = 50
        
    return {
        "entropy_value": float(round(entropy, 3)),
        "obfuscation_risk_level": risk_level,
        "obfuscation_score": score
    }
