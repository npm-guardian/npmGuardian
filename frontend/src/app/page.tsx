import DependencyGraph from '@/components/DependencyGraph';
import RiskCard from '@/components/RiskCard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-zinc-950 text-white">
      <div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          npm-Guardian Dashboard
        </h1>
        <div className="flex gap-4">
           <button className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition">
              Connect GitHub
           </button>
           <button className="px-4 py-2 bg-emerald-600 rounded-md font-bold hover:bg-emerald-500 transition">
              Scan Package
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mt-12">
        <RiskCard 
            title="Total Scans" 
            value="14,231" 
            trend="+12%" 
            status="neutral" 
        />
        <RiskCard 
            title="High Risk Found" 
            value="342" 
            trend="+5%" 
            status="danger" 
        />
        <RiskCard 
            title="Repositories Protected" 
            value="89" 
            trend="Stable" 
            status="success" 
        />
      </div>

      <div className="w-full max-w-7xl h-[600px] mt-12 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900 relative">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-xl font-bold bg-zinc-950/80 p-2 rounded backdrop-blur-md border border-zinc-800">
             Live Threat Graph
          </h2>
        </div>
        <DependencyGraph />
      </div>
    </main>
  );
}
