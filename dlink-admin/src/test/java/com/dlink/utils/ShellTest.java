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
        instance.init("10.46.30.51", 22, "svolt", "Svolt.cn");
        String res = instance.execCmd("hadoop fs -du -v /user/hive/warehouse |awk '{ SUM += $1 } END { print SUM/(1024*1024*1024)}'");
        System.out.println(res);
    }

}
