package com.dlink.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.ApiConfigDTO;
import com.dlink.dto.DebugDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiConfig;
import com.dlink.model.Schema;
import com.dlink.service.ApiConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

/**
 * DataApiController
 *
 * @author cl1226
 * @since 2023/5/17 14:19
 **/
@Slf4j
@RestController
@RequestMapping("/api/dataservice/config")
public class ApiConfigController {

    @Autowired
    private ApiConfigService service;

    @Value("${dinky.api.context}")
    String apiContext;

    @PostMapping("/page")
    public Result page(@RequestBody SearchCondition searchCondition) throws Exception {
        Page<ApiConfig> page = service.page(searchCondition);
        return Result.succeed(page, "获取成功");
    }

    @GetMapping("/detail")
    public Result getDetail(HttpServletRequest request, @RequestParam Integer id) throws UnknownHostException {
        ApiConfigDTO detail = service.getDetail(id);
        String domain = request.getScheme() + "://" + InetAddress.getLocalHost().getHostAddress() + ":" + request.getServerPort();
        detail.setDomain(domain);
        detail.setPath(apiContext + "/" + (detail.getPath().startsWith("/") ? detail.getPath().substring(1) : detail.getPath()));
        if (detail == null) {
            return Result.failed(null, "获取失败");
        }
        return Result.succeed(detail, "获取成功");
    }

    @PutMapping
    public Result saveOrUpdate(@RequestBody ApiConfig apiConfig) {
        try {
            service.addOrEdit(apiConfig);
            return Result.succeed(apiConfig, "创建成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("创建失败");
        }
    }

    @DeleteMapping
    public Result delete(@RequestBody SearchCondition searchCondition) {
        try {
            service.removeBatchByIds(searchCondition.getIds());
            return Result.succeed(searchCondition.getIds(), "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("删失败");
        }
    }

    @GetMapping("/online")
    public Result online(@RequestParam Integer id) {
        ApiConfig apiConfig = service.online(id);
        if (apiConfig == null) {
            return Result.failed("上线失败");
        } else {
            return Result.succeed(apiConfig, "上线成功");
        }
    }

    @GetMapping("/offline")
    public Result offline(@RequestParam Integer id) {
        ApiConfig apiConfig = service.offline(id);
        if (apiConfig == null) {
            return Result.failed("下线失败");
        } else {
            return Result.succeed(apiConfig, "下线成功");
        }
    }

    @PostMapping("/executeSql")
    public Result executeSql(@RequestBody DebugDTO debugDTO) {
        Result result = service.executeSql(debugDTO);
        return result;
    }

    @GetMapping("/getMenu/{code}")
    public Result getMenuByCode(@PathVariable String code, @RequestParam(required = false) String value) {
        Result result = service.getMenuByCode(code, value);
        return result;
    }

    @GetMapping("/getSchemaByDatasourceId")
    public Result getSchemaByDatasourceId(@RequestParam Integer id) {
        List<Schema> schemaByDatabase = service.getSchemaByDatabase(id);
        return Result.succeed(schemaByDatabase, "获取成功");
    }

    @PutMapping("/configureAuth")
    public Result configureAuth(@RequestParam Integer id, @RequestParam Integer appId) {
        ApiConfig apiConfig = service.configureAuth(id, appId);
        if (apiConfig == null) {
            return Result.failed("配置失败");
        }
        return Result.succeed(apiConfig, "配置成功");
    }

    @GetMapping("/checkPath")
    public Result checkPath(@RequestParam String path) {
        ApiConfig apiConfig = service.checkPath(path);
        if (apiConfig != null) {
            return Result.failed("路径重复, 请重新填写");
        }
        return  Result.succeed(null, "校验通过");
    }

}
