import React, { useState } from 'react';
import { Button, Table, Space, Layout, message, Popconfirm, notification, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
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

  const props: UploadProps = {
    name: 'file',
    action: 'http://localhost:8080/upload',
    headers: {
      authorization: 'authorization-text',
    },
    async onChange(info: any) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);

        setLoading(true);
        const { data } = await axios.get('http://localhost:8080/files');
        setItems(data);
        setLoading(false);

      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

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
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
        {renderTable()}
      </Content>
    </Layout>
  );
}

export default App;
