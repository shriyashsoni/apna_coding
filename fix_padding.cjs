const fs = require('fs');
const path = require('path');
const pagesDir = path.join('src', 'pages');

const files = fs.readdirSync(pagesDir);
let changedCount = 0;

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix general py-12 containers
    content = content.replace(/className="flex-1 container mx-auto px-4 py-12"/g, 'className="flex-1 container mx-auto px-4 pt-32 pb-12"');
    
    // Fix Terms, Privacy, Community, etc which might have slightly different classes
    content = content.replace(/className="container mx-auto px-4 py-12/g, 'className="container mx-auto px-4 pt-32 pb-12');
    content = content.replace(/className="min-h-screen pt-20 pb-12/g, 'className="min-h-screen pt-32 pb-12');
    content = content.replace(/className="container mx-auto px-4 py-8/g, 'className="container mx-auto px-4 pt-32 pb-8');
    content = content.replace(/className="min-h-screen flex flex-col bg-background text-foreground/g, 'className="min-h-screen flex flex-col bg-background text-foreground pt-24');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      changedCount++;
      console.log(`Updated ${file}`);
    }
  }
});

console.log(`Updated ${changedCount} files.`);
