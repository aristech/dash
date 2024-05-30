import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import AdminLayout from '@/layouts/Admin/AdminLayout';
import { useRouter } from 'next/router';
import {  useDispatch, useSelector } from 'react-redux';

const UploadCatalog = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { gridData  } = useSelector((state) => state.catalog)

   
    // Create the datatable headers dynamically
    const renderColumns = () => {
        //make this correct:
        if(gridData && !gridData.length) {
            router.push('/dashboard/suppliers')
            return;
        };
        let columns = Object.keys(gridData[0])
        return columns.map((col, index) => {
            return <Column key={index} field={col} header={col} />;
        });
    };
    return (
        <AdminLayout >
            <div className='mt-2'>
                <DataTable
                    header="Πίνακας Καταλόγου"
                    loading={loading}
                    rows={20}
                    paginator
                    rowsPerPageOptions={[20, 50, 100, 200, 500]}
                    selectionMode="radiobutton"
                    value={gridData}
                    tableStyle={{ minWidth: '50rem' }}
                >
                    {renderColumns()}
                </DataTable>
                <div>
                    <Button
                        label="Eπόμενο"
                        size="small"
                        icon="pi pi-arrow-right"
                        className="mb-2 mt-3 bg-success"
                        onClick={() => {
                            router.push('/dashboard/catalogs/other-keys')
                        }}
                    />
                </div>
            </div>

        </AdminLayout >
    );
};








export default UploadCatalog;

