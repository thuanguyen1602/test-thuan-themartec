import React, { useState } from 'react';
import { Button, Table, Space, Layout, message, Popconfirm, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import moment from 'moment';
import './App.css';
import { Item } from './item.interface';

const { Content } = Layout;

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);

  const onClickLoad = async () => {
    try {
      setLoading(true);
      await axios.get('http://localhost:8080/authorize');
      const { data } = await axios.get('http://localhost:8080/files');
      setItems(data);
      setLoading(false); 
    } catch (error) {
      setLoading(false);
    }
  }

  const confirm = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/files/${id}`);
      const { data } = await axios.get('http://localhost:8080/files');
      setItems(data);
      setLoading(false);
    } catch (error: any) {
      const {response: {data}} = error;
      notification.error({
        message: 'Error',
        description: data.message
      });
      setLoading(false);
    }
  };
  
  const cancel = (e?: React.MouseEvent<HTMLElement>) => {
    console.log(e);
    message.error('Click on No');
  };

  const renderTable = () => {
    
    const columns: ColumnsType<Item> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => <a target={'_blank'} href={record.webViewLink}>{record.name}</a>
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
          <Popconfirm
            title="Are you sure to delete this file?"
            onConfirm={() => confirm(record.id)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <a href="#">Delete</a>
          </Popconfirm>
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
