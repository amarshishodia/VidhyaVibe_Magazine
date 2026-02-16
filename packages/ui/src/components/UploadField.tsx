import React from 'react';
import { Upload, Button, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

type Props = {
  name?: string;
  onUpload: (file: File, onProgress?: (p: number) => void) => Promise<any>;
  accept?: string;
  maxSizeBytes?: number;
};

export const UploadField: React.FC<Props> = ({ name = 'file', onUpload, accept, maxSizeBytes }) => {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  return (
    <div>
      <Upload
        accept={accept}
        beforeUpload={async (file) => {
          if (maxSizeBytes && file.size > maxSizeBytes) {
            alert('File exceeds maximum size');
            return Upload.LIST_IGNORE;
          }
          setUploading(true);
          setProgress(0);
          try {
            await onUpload(file as File, (p: number) => setProgress(p));
          } finally {
            setUploading(false);
            setProgress(0);
          }
          // prevent default upload
          return false;
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} loading={uploading}>
          Upload
        </Button>
      </Upload>
      {uploading && <Progress percent={Math.round(progress)} />}
    </div>
  );
};

