import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { AuditLog } from '../types';

interface LogsProps {
    auditLogs: AuditLog[];
}

const Logs: React.FC<LogsProps> = ({ auditLogs }) => {
    return (
        <div className="py-12 flex flex-col items-center">
            <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
                <DataTable value={auditLogs} stripedRows rowHover paginator rows={15}>
                    <Column field="createdAt" header="Timestamp" body={(row) => <div className="py-4 px-6 text-xs font-bold text-gray-400">{new Date(row.createdAt).toLocaleString()}</div>} sortable></Column>
                    <Column field="user.username" header="User" body={(row) => <div className="py-4 px-6 text-sm font-black text-primary  tracking-widest">{row.user?.username || 'SYSTEM'}</div>}></Column>
                    <Column field="action" header="Action" body={(row) => <div className="py-4 px-6 text-xs font-black">{row.action}</div>}></Column>
                    <Column field="details" header="Details" body={(row) => <div className="py-4 px-6 text-xs text-gray-500 italic">{row.details}</div>}></Column>
                </DataTable>
            </div>
        </div>
    );
};

export default Logs;
