package com.dlink.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dlink.common.result.Result;
import com.dlink.model.DataBase;
import com.dlink.model.Schema;
import com.dlink.service.DataBaseService;
import com.dlink.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * MenuServiceImpl
 *
 * @author cl1226
 * @since 2023/6/13 13:19
 **/
@Service
public class MenuServiceImpl implements MenuService {

    @Override
    public Result list(String type) {
        String datasourceType = "Hive,StarRocks,Mysql";
        List<Map<String, String>> list = new ArrayList<>();
        Arrays.stream(datasourceType.split(",")).forEach(x -> {
            Map<String, String> map = new HashMap<>();
            map.put("label", x);
            map.put("value", x);
            list.add(map);
        });
        String itemType = "Table,Column,Database";
        List<Map<String, String>> list2 = new ArrayList<>();
        Arrays.stream(itemType.split(",")).forEach(x -> {
            Map<String, String> map = new HashMap<>();
            map.put("label", x);
            map.put("value", x);
            list2.add(map);
        });
        // 获取数据源类型
        if ("DBTYPE".equals(type)) {
            return Result.succeed(list, "获取成功");
        }
        if ("ITEMTYPE".equals(type)) {
            return Result.succeed(list2, "获取成功");
        }
        return null;
    }

}
