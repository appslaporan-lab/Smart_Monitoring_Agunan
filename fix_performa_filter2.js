const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(
  "const rows = await prisma.pinjamanPeriode.findMany({", 
  "let rows = await prisma.pinjamanPeriode.findMany({\n"
);

code = code.replace(
  "const matrixRadiusRanges = [", 
  "rows = rows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));\n\n  const matrixRadiusRanges = ["
);

if (!code.includes("canAccessKantorData")) {
  console.log("Failed to insert filter logic");
} else {
  fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
  console.log('Successfully added performa filter logic');
}
