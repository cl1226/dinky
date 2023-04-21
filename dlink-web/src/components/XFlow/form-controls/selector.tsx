import type { NsJsonSchemaForm, NsGraphCmd } from '@antv/xflow'
import { useXFlowApp, MODELS, XFlowGraphCommands } from '@antv/xflow'
import { DownOutlined } from "@ant-design/icons";
import { FormItemWrapper } from '@antv/xflow'
import { Form, TreeSelect } from 'antd'
import React, {useState, useEffect} from 'react'
import {convertToTreeData, TreeDataNode} from "@/components/Scheduler/SchedulerTree/Function";
import {getCatalogueTreeData} from "@/pages/DataStudio/service";
import {getIcon} from "@/components/Scheduler/icon";
import style from "./index.less";

export const SelectorShape: React.FC<NsJsonSchemaForm.IControlProps> = props => {
  const { controlSchema } = props
  const { required, tooltip, extra, name, label, placeholder } = controlSchema

  return (
    <FormItemWrapper schema={controlSchema}>
      {({ disabled, hidden, initialValue }) => {
        return (
          <Form.Item
            name={name}
            label={label}
            initialValue={initialValue}
            tooltip={tooltip}
            extra={extra}
            required={required}
            hidden={hidden}
          >
            {/* 这里的组件可以拿到onChange和value */}
            <Select controlSchema={controlSchema} placeholder={placeholder} disabled={disabled} />
          </Form.Item>
        )
      }}
    </FormItemWrapper>
  )
}

const Select: React.FC = () => {
  const [value, setValue] = useState<string>();
  const [treeData, setTreeData] = useState<TreeDataNode[]>();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    getTreeData();
  }, []);

  const loop = (data: any) =>
    data?.map((item: any) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      item.icon = getIcon(item.type);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className={style['site-tree-search-value']}>{searchValue}</span>
            {afterStr}
            </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children) {
        return {
          isLeaf: item.isLeaf,
          name: item.name,
          id: item.id,
          taskId: item.taskId,
          parentId: item.parentId,
          path: item.path,
          icon: item.isLeaf ? item.icon : '',
          title: item.name,
          value: item.taskId,
          key: item.key,
          children: loop(item.children)
        };
      }
      return {
        isLeaf: item.isLeaf,
        name: item.name,
        id: item.id,
        taskId: item.taskId,
        parentId: item.parentId,
        path: item.path,
        icon: item.isLeaf ? item.icon : '',
        title: item.name,
        value: item.taskId,
        key: item.key,
      };
    });

  const onChange = (newValue: string) => {
    console.log(newValue);
    setValue(newValue);
  };

  const getTreeData = async () => {
    const result = await getCatalogueTreeData();
    let data = result.datas;
    setTreeData(convertToTreeData(data, 0));
  };

  return (
    <TreeSelect
      value={value}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeData={treeData}
      placeholder="Please select"
      onChange={onChange}
      switcherIcon={<DownOutlined/>}
      showSearch={true}
      treeLine={true}
    />
  ) 
}
