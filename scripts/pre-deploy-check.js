#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证所有必要的配置和依赖是否就绪
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署前检查...\n');

// 检查必要的文件
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'prisma/schema.prisma',
  'src/app/layout.tsx',
  'src/lib/auth.ts',
  'src/lib/prisma.ts',
  'DEPLOYMENT.md',
  '.env.example'
];

console.log('📁 检查必要文件...');
let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    missingFiles.push(file);
  }
});

// 检查package.json中的必要依赖
console.log('\n📦 检查关键依赖...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'next',
  'react',
  'next-auth',
  '@prisma/client',
  'prisma',
  '@google/generative-ai'
];

let missingDeps = [];
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - 缺失`);
    missingDeps.push(dep);
  }
});

// 检查环境变量示例文件
console.log('\n🔧 检查环境变量配置...');
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_AI_API_KEY',
  'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN'
];

let missingEnvVars = [];
requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`❌ ${envVar} - 缺失`);
    missingEnvVars.push(envVar);
  }
});

// 检查数据库迁移文件
console.log('\n🗄️ 检查数据库迁移...');
const migrationsDir = 'prisma/migrations';
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f !== 'migration_lock.toml');
  if (migrations.length > 0) {
    console.log(`✅ 找到 ${migrations.length} 个迁移文件`);
    migrations.forEach(migration => {
      console.log(`   - ${migration}`);
    });
  } else {
    console.log('❌ 未找到迁移文件');
  }
} else {
  console.log('❌ 迁移目录不存在');
}

// 检查构建配置
console.log('\n🔨 检查构建配置...');
const scripts = packageJson.scripts || {};
const requiredScripts = ['build', 'start', 'dev'];
let missingScripts = [];

requiredScripts.forEach(script => {
  if (scripts[script]) {
    console.log(`✅ npm run ${script}`);
  } else {
    console.log(`❌ npm run ${script} - 缺失`);
    missingScripts.push(script);
  }
});

// 总结检查结果
console.log('\n📊 检查结果总结:');
console.log('==================');

const hasErrors = missingFiles.length > 0 || missingDeps.length > 0 || 
                 missingEnvVars.length > 0 || missingScripts.length > 0;

if (hasErrors) {
  console.log('❌ 发现问题，需要修复:');
  
  if (missingFiles.length > 0) {
    console.log(`\n缺失文件: ${missingFiles.join(', ')}`);
  }
  
  if (missingDeps.length > 0) {
    console.log(`\n缺失依赖: ${missingDeps.join(', ')}`);
    console.log('运行: npm install ' + missingDeps.join(' '));
  }
  
  if (missingEnvVars.length > 0) {
    console.log(`\n缺失环境变量: ${missingEnvVars.join(', ')}`);
    console.log('请更新 .env.example 文件');
  }
  
  if (missingScripts.length > 0) {
    console.log(`\n缺失脚本: ${missingScripts.join(', ')}`);
    console.log('请更新 package.json 文件');
  }
  
  console.log('\n请修复上述问题后重新运行检查。');
  process.exit(1);
} else {
  console.log('✅ 所有检查通过！');
  console.log('\n🎉 项目已准备好部署到生产环境！');
  console.log('\n下一步:');
  console.log('1. 确保所有环境变量在部署平台中正确配置');
  console.log('2. 运行数据库迁移: npx prisma migrate deploy');
  console.log('3. 测试生产构建: npm run build');
  console.log('4. 部署到Vercel或其他平台');
  
  process.exit(0);
}