#! /usr/bin/env node

// 命令行配置指令
const program = require('commander');
// import program from 'commander'

// 声明版本
program.version(`lqs-cli ${require("../package.json").version}`);

// 设置首行提示信息
program.name('lqs-cli').usage(`<command> [option]`);

// 配置create命令
program
	.command("create <project-name>")
	.description("create a new project")
	.option("-f, --force", "overwrite target directory if it exists")
	.action((projectName, cmd) => {
		// 处理用户输入create指令附加的参数
		require('../lib/create')(projectName, cmd);
	})

// process.argv是nodejs提供的属性，获取用户输入的参数
// console.log(process.argv);
program.parse(process.argv);


