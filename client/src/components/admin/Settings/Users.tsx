import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import { confirmDialog } from 'primereact/confirmdialog';
import api from '../../../api/axios';
import type { User } from '../types';

interface UsersProps {
    users: User[];
    token: string | null;
    fetchData: () => Promise<void>;
    toast: React.RefObject<any>;
}

const Users: React.FC<UsersProps> = ({ users, token, fetchData, toast }) => {
    const { t } = useTranslation();

    const handleDeleteUser = (id: number, type: 'soft' | 'hard') => {
        confirmDialog({
            message: type === 'soft' ? t('admin.confirmSoftDelete') : t('admin.confirmHardDelete'),
            header: t('admin.confirm.title'),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: type === 'hard' ? 'p-button-danger' : 'p-button-warning',
            accept: async () => {
                try {
                    await api.delete(`/api/admin/users/${id}?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
                    toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.userDeleted')});
                    fetchData();
                } catch (error) { console.error(error); }
            }
        });
    }

    return (
        <div className="py-12 flex flex-col items-center">
            <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
                <DataTable value={users} stripedRows rowHover paginator rows={15} responsiveLayout="scroll">
                    <Column field="username" header={t('landing.username')} sortable className="text-lg font-black  tracking-wider px-10 py-8"></Column>
                    <Column field="email" header="Email" className="text-sm font-medium px-10 py-8 text-gray-400"></Column>
                    <Column field="score" header="Points" sortable className="text-4xl font-black text-primary px-10 py-8" align="center"></Column>
                    <Column header="Status" body={(rowData: User) => (
                        <div className="flex items-center gap-8 px-10 py-8">
                            <InputSwitch checked={rowData.isActive} disabled={!!rowData.deletedAt} onChange={(e) => {
                                api.post('/api/admin/users/toggle-status', { id: rowData.id, isActive: e.value }, { headers: { Authorization: `Bearer ${token}` } })
                                    .then(() => fetchData());
                            }} />
                            <Tag severity={rowData.deletedAt ? 'danger' : (rowData.isActive ? 'success' : 'warning')} 
                                    value={rowData.deletedAt ? t('admin.userStatus.deleted') : (rowData.isActive ? t('admin.userStatus.active') : t('admin.userStatus.off'))} 
                                    className="text-[10px] font-black px-5 py-3 shadow-6" />
                        </div>
                    )} align="center"></Column>
                    <Column header="Actions" body={(rowData: User) => (
                        <div className="flex gap-3 px-10 py-8">
                            {!rowData.deletedAt && (
                                <Button icon="pi pi-user-minus" rounded text severity="warning" tooltip={t('admin.softDelete')} onClick={() => handleDeleteUser(rowData.id, 'soft')} />
                            )}
                            <Button icon="pi pi-user-times" rounded text severity="danger" tooltip={t('admin.hardDelete')} onClick={() => handleDeleteUser(rowData.id, 'hard')} />
                        </div>
                    )} align="center"></Column>
                </DataTable>
            </div>
        </div>
    );
};

export default Users;
