import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const contentDir = join(__dirname, '../content');
const devicesDir = join(__dirname, '../content/devices');

const title = '📊 Blog quick stats';

try {
    // Count posts and drafts
    const files = await readdir(contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md') && file !== '_template.md');
    
    let draftCount = 0;
    for (const file of mdFiles) {
        const content = await readFile(join(contentDir, file), 'utf-8');
        if (content.includes('draft: true')) {
            draftCount++;
        }
    }
    
    // Count device files
    const deviceFiles = await readdir(devicesDir);
    const hyphenDevices = deviceFiles.filter(file => file.startsWith('-')).length;
    
    console.log(`\n${title}`);
    
    const stats = [
        { Category: '📄 Posts', Count: mdFiles.length },
        { Category: '📝 Drafts', Count: draftCount },
        { Category: '📱 Device Cards', Count: deviceFiles.length },
        { Category: '📝 Device Card Drafts', Count: hyphenDevices }
    ];
    
    // Custom table formatting to remove index column
    console.table(stats, ['Category', 'Count']);
} catch (error) {
    console.error('🚨 Error reading content directory:', error);
}
