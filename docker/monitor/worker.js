const { createClient } = require('redis');
const { execSync } = require('child_process');

async function startWorker() {
    const client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    console.log('[Sandbox Worker] Listening for packages to dynamically execute...');

    while (true) {
        try {
            // Wait for jobs on 'sandbox-jobs' queue
            const result = await client.blPop('sandbox-jobs', 0);
            const job = JSON.parse(result.element);
            
            console.log(`[Sandbox Worker] Processing job ${job.scanId}: installing ${job.target}`);
            
            // Dangerous: Execute npm install. Sysdig will monitor this.
            // In a real app, this folder is ephemeral per job
            try {
                execSync(`npm install ${job.target} --ignore-scripts=false`, { stdio: 'ignore' });
                console.log(`[Sandbox Worker] Installation successful for ${job.target}.`);
            } catch (err) {
                 console.log(`[Sandbox Worker] Installation failed for ${job.target}. Potential postinstall crash.`);
            }

            // A separate aggregator process would read /var/log/sysdig_net.log
            // and push results back to the API Gateway.
            
        } catch (e) {
            console.error(e);
        }
    }
}

startWorker();
