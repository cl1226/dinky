package com.dlink.utils;

import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.StrUtil;
import com.jcraft.jsch.*;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

/**
 * ShellUtil
 *
 * @author cl1226
 * @since 2023/6/15 14:41
 **/
public class ShellUtil {

    /** 未调用初始化方法 错误提示信息 */
    private static final String DONOT_INIT_ERROR_MSG = "please invoke init(...) first!";

    private static Session session;

    private ShellUtil() {
    }

    /**
     * 获取ExecuteShellUtil类实例对象
     *
     * @return 实例
     * @date 2019/4/29 16:58
     */
    public static ShellUtil getInstance() {
        return new ShellUtil();
    }

    /**
     * 初始化
     *
     * @param ip
     *         远程Linux地址
     * @param port
     *         端口
     * @param username
     *         用户名
     * @param password
     *         密码
     * @throws JSchException
     *         JSch异常
     * @date 2019/3/15 12:41
     */
    public void init(String ip, Integer port, String username, String password) throws JSchException {
        JSch jsch = new JSch();
        session = jsch.getSession(username, ip, port);
        session.setPassword(password);
        Properties sshConfig = new Properties();
        sshConfig.put("StrictHostKeyChecking", "no");
        session.setConfig(sshConfig);
        session.connect(1200 * 1000);
    }

    /**
     * 执行一条命令,探活使用
     */
    public static String execCmd(Session session,String command) throws Exception {
        // 打开执行shell指令的通道
        Channel channel = session.openChannel("exec");
        ChannelExec channelExec = (ChannelExec) channel;
        channelExec.setCommand("source /etc/profile && source ~/.bash_profile && source ~/.bashrc &&  adb devices && locale charmap");
        channelExec.setCommand(command);
        channel.setInputStream(null);
        channelExec.setErrStream(System.err);
        channel.connect();

        StringBuilder sb = new StringBuilder(16);
        try (InputStream in = channelExec.getInputStream();
             InputStreamReader isr = new InputStreamReader(in, StandardCharsets.UTF_8);
             BufferedReader reader = new BufferedReader(isr)) {
            String buffer;
            while ((buffer = reader.readLine()) != null) {
                sb.append("\n").append(buffer);
            }
            IoUtil.close(reader);
            IoUtil.close(isr);
            IoUtil.close(in);
            return sb.toString();
        }finally {
            if (channelExec.isConnected()) {
                channelExec.disconnect();
            }
            if (channel.isConnected()) {
                channel.disconnect();
            }
        }
    }

    /**
     * 执行一条命令
     */
    public String execCmd(String command) throws Exception {
        Channel channel = session.openChannel("exec");
        ChannelExec channelExec = (ChannelExec) channel;
        channelExec.setCommand("source /etc/profile && source ~/.bash_profile && source ~/.bashrc &&  adb devices && locale charmap");
        channelExec.setCommand(command);
        channel.setInputStream(null);
        channelExec.setErrStream(System.err);
        channel.connect();

        StringBuilder sb = new StringBuilder(16);
        try (InputStream in = channelExec.getInputStream();
             InputStreamReader isr = new InputStreamReader(in, StandardCharsets.UTF_8);
             BufferedReader reader = new BufferedReader(isr)) {
            String buffer;
            while ((buffer = reader.readLine()) != null) {
                sb.append("\n").append(buffer);
            }
            IoUtil.close(reader);
            IoUtil.close(isr);
            IoUtil.close(in);

            return sb.toString();
        } finally {
            if (channelExec != null && channelExec.isConnected()) {
                channelExec.disconnect();
            }
            if ( channel != null && channel.isConnected()) {
                channel.disconnect();
            }
        }
    }

    // 执行Linux命令
    public void execute(String command) {
        BufferedReader reader = null;
        Channel channel = null;
        System.out.println("---------------------------");
        System.out.println("input:" + "【" + command + "】");
        System.out.println("---------------------------");
        try {
            channel = session.openChannel("exec");
            ((ChannelExec) channel).setCommand(command);
            channel.setInputStream(null);
            ((ChannelExec) channel).setErrStream(System.err);
            channel.connect();
            InputStream in = channel.getInputStream();
            reader = new BufferedReader(new InputStreamReader(in,
                    Charset.forName("UTF-8")));
            String buf = null;
            System.out.println("output:" + "\n");
            StringBuffer buffer = new StringBuffer();
            while ((buf = reader.readLine()) != null) {
                System.out.println(buf);
                buffer.append(buf);
                buffer.append("\n");
            }
            System.out.println("---------------------------");
            channel.disconnect();
        } catch (JSchException | IOException e) {
            e.printStackTrace();
        } finally {
            if (channel != null && channel.isConnected()) {
                channel.disconnect();
            }
            closeConnect();
        }

    }

    /**
     * 执行一条命令 获取错误流中的内容
     */
    public String execCmdErrContent(String command) throws Exception {
        Channel channel = session.openChannel("exec");
        ChannelExec channelExec = (ChannelExec) channel;
        channelExec.setCommand(command);
        channel.setInputStream(null);
        ByteArrayOutputStream err  = new ByteArrayOutputStream();
        channelExec.setErrStream(err);
        channel.connect();
        StringBuilder sb = new StringBuilder(16);
        try (InputStream in = channelExec.getErrStream();
             InputStreamReader isr = new InputStreamReader(in, StandardCharsets.UTF_8);
             BufferedReader reader = new BufferedReader(isr)) {
            String buffer;
            while ((buffer = reader.readLine()) != null) {
                sb.append("\n").append(buffer);
            }
            IoUtil.close(reader);
            IoUtil.close(isr);
            IoUtil.close(in);
            IoUtil.close(err);

            if(StrUtil.contains(sb.toString(), "没有那个文件或目录")){
                return "";
            }else{
                return sb.toString();
            }

        } finally {
            if (channelExec != null && channelExec.isConnected()) {
                channelExec.disconnect();
            }
            if ( channel != null && channel.isConnected()) {
                channel.disconnect();
            }
        }
    }

    public static void closeConnect() {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }

}
