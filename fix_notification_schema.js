const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('notifications      Notification[]')) {
  code = code.replace("activityLogs       ActivityLog[]\n}", "activityLogs       ActivityLog[]\n  notifications      Notification[]\n}");
  fs.writeFileSync('prisma/schema.prisma', code);
}
console.log('Notification relation added');
