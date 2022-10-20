import React, { useState } from 'react';
import { Button, Table, Space, Col, Row, Layout } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import axios from 'axios';
import moment from 'moment';
import './App.css';
import { Item } from './item.interface';

const { Content } = Layout;

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10
    },
  });

  const onClickLoad = async () => {
    try {
      setLoading(true);
      await axios.get('http://localhost:8080/authorize');
      const { data } = await axios.get('http://localhost:8080/list');
      setItems(data);
      setLoading(false); 
    } catch (error) {
      setLoading(false);
    }
  }
  const renderTable = () => {
    
    const columns: ColumnsType<Item> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
      },
      {
        title: 'Created Time',
        dataIndex: 'createdTime',
        key: 'createdTime',
        render: (_, record) => moment(record.createdTime).format('LLL')
      },
      {
        title: 'Modified Time',
        dataIndex: 'modifiedTime',
        key: 'modifiedTime',
        render: (_, record) => moment(record.modifiedTime).format('LLL')
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <a>Delete</a>
          </Space>
        ),
      },
    ];
    return <Table rowKey="id" loading={loading} dataSource={items} columns={columns} />;
  }
  return (
    <Layout>
      <Content>
        <Button loading={loading} className="load-btn" onClick={onClickLoad} type="primary">
          {loading ? 'Loading': 'Load'}
        </Button>
        {renderTable()}
      </Content>
    </Layout>
  );
}

export default App;
