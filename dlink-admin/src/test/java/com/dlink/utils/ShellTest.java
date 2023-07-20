package com.dlink.utils;

import com.jcraft.jsch.JSchException;
import org.junit.Test;

/**
 * ShellTest
 *
 * @author cl1226
 * @since 2023/6/15 16:43
 **/
public class ShellTest {

    @Test
    public void shell() throws Exception {
        ShellUtil instance = ShellUtil.getInstance();
        instance.init("sv-mdp-dev-name02", 22, "root", "svolt@1234");
        String res = instance.execCmd("kinit -kt /opt/keytab/svolt.keytab svolt@SVOLT.COM && hadoop fs -du -v /user/hive/warehouse |awk '{ SUM += $1 } END { print SUM/(1024*1024*1024)}'");
        System.out.println(res);
    }

    @Test
    public void shell2() throws Exception {
        ShellUtil instance = ShellUtil.getInstance();
        instance.init("10.46.21.35", 22, "svolt", "Svolt.cn");
        String res = instance.execCmd("source /etc/profile && hadoop fs -du -v /user/hive/warehouse |awk '{ SUM += $1 } END { print SUM }'");
        System.out.println(res);
    }

}
