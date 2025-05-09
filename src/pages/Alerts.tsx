import React, { useState, useMemo, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { AnomalyData } from '../types';
import { ChevronDown, ChevronUp, ArrowUpDown, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { cn } from '../utils/cn';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';

const columnHelper = createColumnHelper<AnomalyData>();

const Alerts: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { anomalyData, selectedFile, addAlert, setAnomalyData } = useAppContext();
  const [alerts, setAlerts] = useState<AnomalyData[]>([]);
  const [severityFilter, setSeverityFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('anomalies')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching alerts:', error);
          return;
        }

        if (data) {
          setAlerts(data.map(item => ({
            date: item.date,
            Usage_kWh: item.usage_kwh,
            'CO2(tCO2)': item.co2_tco2,
            Lagging_Current_Power_Factor: item.power_factor,
            Anomaly_Label: item.anomaly_label,
            FMEA_Diagnosis: item.fmea_diagnosis,
            Alert_Level: item.alert_level,
          })));
        }
      } catch (error) {
        console.error('Error in fetchAlerts:', error);
      }
    };

    if (anomalyData) {
      setAlerts(anomalyData);
    } else {
      fetchAlerts();
    }
  }, [anomalyData]);

  const handleClearAll = async () => {
    try {
      // Delete all records from the anomalies table
      const { error } = await supabase
        .from('anomalies')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        throw error;
      }

      // Clear local state
      setAlerts([]);
      setAnomalyData(null);
      
      addAlert({
        type: 'success',
        message: 'Successfully cleared all alerts',
      });
    } catch (error: any) {
      console.error('Error clearing alerts:', error);
      addAlert({
        type: 'error',
        message: 'Failed to clear alerts',
      });
    }
  };

  const filteredData = useMemo(() => {
    if (severityFilter === null) return alerts;
    return alerts.filter(alert => alert.Alert_Level === severityFilter);
  }, [alerts, severityFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Timestamp',
        cell: (info) => {
          const dateValue = info.getValue();
          if (!dateValue) return 'Invalid Date';
          
          const date = new Date(dateValue);
          return isValid(date) ? format(date, 'PPpp') : 'Invalid Date';
        },
      }),
      columnHelper.accessor('Usage_kWh', {
        header: 'Usage (kWh)',
        cell: (info) => info.getValue().toFixed(2),
      }),
      columnHelper.accessor('CO2(tCO2)', {
        header: 'CO2 (tCO2)',
        cell: (info) => info.getValue().toFixed(2),
      }),
      columnHelper.accessor('FMEA_Diagnosis', {
        header: 'Diagnosis',
      }),
      columnHelper.accessor('Alert_Level', {
        header: 'Severity',
        cell: (info) => {
          const level = info.getValue();
          const severity = level === 3 ? 'Critical' : level === 2 ? 'Moderate' : 'Minor';
          const colors = {
            Critical: 'bg-error-100 text-error-700',
            Moderate: 'bg-warning-100 text-warning-700',
            Minor: 'bg-success-100 text-success-700',
          };

          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                colors[severity]
              )}
            >
              {severity}
            </span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const severityCounts = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      acc[alert.Alert_Level] = (acc[alert.Alert_Level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }, [alerts]);

  return (
    <PageContainer
      title="Alerts"
      description="Monitor and manage anomaly detection alerts"
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No alerts found. Train a model to detect anomalies.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setSeverityFilter(null)}
                    variant={severityFilter === null ? 'primary' : 'outline'}
                    size="sm"
                  >
                    All ({alerts.length})
                  </Button>
                  <Button
                    onClick={() => setSeverityFilter(3)}
                    variant={severityFilter === 3 ? 'primary' : 'outline'}
                    size="sm"
                    className="text-error-700"
                  >
                    Critical ({severityCounts[3] || 0})
                  </Button>
                  <Button
                    onClick={() => setSeverityFilter(2)}
                    variant={severityFilter === 2 ? 'primary' : 'outline'}
                    size="sm"
                    className="text-warning-700"
                  >
                    Moderate ({severityCounts[2] || 0})
                  </Button>
                  <Button
                    onClick={() => setSeverityFilter(1)}
                    variant={severityFilter === 1 ? 'primary' : 'outline'}
                    size="sm"
                    className="text-success-700"
                  >
                    Minor ({severityCounts[1] || 0})
                  </Button>
                </div>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  icon={<Trash2 size={16} />}
                  className="text-error-500 hover:text-error-600 hover:bg-error-50"
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={cn(
                                'flex items-center gap-1',
                                header.column.getCanSort() && 'cursor-pointer select-none'
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                header.column.getCanSort() && (
                                  <ArrowUpDown className="h-4 w-4" />
                                )
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant="outline"
                  size="sm"
                  icon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="outline"
                  size="sm"
                  icon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="text-sm border rounded px-2 py-1"
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default Alerts;