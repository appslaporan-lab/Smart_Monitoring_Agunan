const fs = require('fs');

// 1. Delete User API
let deleteCode = fs.readFileSync('app/api/superadmin/users/[id]/route.ts', 'utf8');
if (!deleteCode.includes('logActivity')) {
  deleteCode = deleteCode.replace("import { getCurrentUser } from '@/lib/session';", "import { getCurrentUser } from '@/lib/session';\nimport { logActivity } from '@/lib/audit';");
  
  const oldDelete = `await prisma.user.delete({\n      where: { id: userId },\n    });`;
  const newDelete = `const deletedUser = await prisma.user.delete({\n      where: { id: userId },\n    });\n\n    await logActivity({\n      userId: currentUser.id,\n      username: currentUser.username,\n      role: currentUser.role,\n      action: 'DELETE_USER',\n      entity: 'User',\n      entityId: userId.toString(),\n      details: \`Dihapus oleh superadmin. Username target: \${deletedUser.username}\`\n    });`;
  
  deleteCode = deleteCode.replace(oldDelete, newDelete);
  fs.writeFileSync('app/api/superadmin/users/[id]/route.ts', deleteCode);
}

// 2. Approve User API
let approveCode = fs.readFileSync('app/api/superadmin/users/[id]/approve/route.ts', 'utf8');
if (!approveCode.includes('logActivity')) {
  approveCode = approveCode.replace("import { getCurrentUser } from '@/lib/session';", "import { getCurrentUser } from '@/lib/session';\nimport { logActivity } from '@/lib/audit';");
  
  const oldApprove = `const user = await prisma.user.update({
      where: { id: userId },
      data: { status, role },
    });`;
    
  const newApprove = `const user = await prisma.user.update({
      where: { id: userId },
      data: { status, role },
    });
    
    await logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: status === 'APPROVED' ? 'APPROVE_USER' : 'REJECT_USER',
      entity: 'User',
      entityId: userId.toString(),
      details: \`User \${user.username} \${status} dengan role \${role}\`
    });`;

  approveCode = approveCode.replace(oldApprove, newApprove);
  fs.writeFileSync('app/api/superadmin/users/[id]/approve/route.ts', approveCode);
}

console.log('Audit hooked to Users API');
