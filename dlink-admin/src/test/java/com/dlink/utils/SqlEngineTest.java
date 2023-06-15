package com.dlink.utils;

import com.github.freakchick.orange.SqlMeta;
import com.github.freakchick.orange.node.SqlNode;
import com.github.freakchick.orange.tag.XmlParser;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

/**
 * SqlEngineTest
 *
 * @author cl1226
 * @since 2023/6/12 9:55
 **/
public class SqlEngineTest {

    @Test
    public void test() {
        String sql = "select * from dlink.dlink_api_catalogue \n" +
                "<where> \n" +
                "<if test=\"id != null\">id=${id}</if>\n" +
                "<if test=\"name != null\">and name = '${name}'</if></where>";
//        String sql = "select * from dlink.dlink_api_catalogue \n" +
//                "where id=${id} and name=${name}" ;
        Map<String, Object> map = new HashMap<>();
        map.put("name", "a");
        SqlMeta parse = SqlEngineUtils.getEngine().parse(sql, map);
        System.out.println(parse.getSql());
    }

}
