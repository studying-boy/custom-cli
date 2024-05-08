const Client = require('ssh2-sftp-client'); // 用了连接服务器进行文件or文件夹相关操作
const ora = require('ora'); // 用来实现loading加载效果
const fs = require('fs');
const path = require('path');
const chalk = require('chalk')

async function getSSHConfig() {
    const isExistSSHConfig = fs.existsSync(path.join(process.cwd(), './ssh.config.js'));
    // 如果不存在配置文件，则创建
    if(!isExistSSHConfig) {
        // 提示文件不存在
        console.log(
            chalk.red.bold(`\n【配置文件不存在】开始生成 ${ chalk.yellow('ssh.config.js') } 配置文件！`)
        )
        fs.writeFileSync(
            path.join(process.cwd(), './ssh.config.js'),
            `const sshConfig = {
                host: '<HOSTNAME>',
                port: '22',
                username: 'root',
                password: '<PASSWORD>',
            };
            
            const remoteFolderPath = '/usr/local/src/dist';
            const localFolderPath = './dist';
            module.exports = {
                sshConfig,
                remoteFolderPath,
                localFolderPath
            }`,
            'utf-8'
        )
        console.log(
            chalk.green(`\n配置创建成功，请填写服务器配置信息后重新构建！`)
        )
        process.exit(0);
    } else {
        return require(path.join(process.cwd(), './ssh.config.js'));
    }
}

module.exports = async function () {
    const config = await getSSHConfig();
    console.log(config);
    if(!config) {
        throw new Error;
    }
    const spinner = ora('发布脚本开始执行--->').start(); // 开始加载...
    const sftp = new Client(); // 实例化用于调用其自带的方法
    try {
        spinner.text = '连接服务器...';
        await sftp.connect(config.sshConfig); // 使用上述配置连接远程服务器
        spinner.text = '连接服务器成功';
        if(await sftp.exists(config.remoteFolderPath)) {
            spinner.text = '发现远程目录存在';
            await sftp.rmdir(config.remoteFolderPath, true); // 把旧的dist删除掉
            spinner.text = '远程目录删除成功'
        }
        await sftp.mkdir(config.remoteFolderPath);
        spinner.text = '上传文件...'
        await sftp.uploadDir(config.localFolderPath, config.remoteFolderPath);
        spinner.text = '新的文件夹上传成功'
        
    } catch (err) {
        console.error(err)
    } finally {
        await sftp.end();
        spinner.info('脚本执行完毕');
    }
}