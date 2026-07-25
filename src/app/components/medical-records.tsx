import React, { useState, useEffect } from 'react';
import { medicalRecords as recordsApi } from '../../lib/api';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Plus,
  FileText,
  Download,
  ChevronRight,
  User,
  Calendar,
  HardDrive,
  File,
  Image as ImageIcon,
  Stethoscope,
  FlaskConical,
  Pill,
} from 'lucide-react';
import { Progress } from './ui/progress';

interface MedicalRecord {
  id: string;
  type: 'lab' | 'imaging' | 'notes' | 'reports' | 'prescriptions';
  title: string;
  date: Date;
  provider?: string;
  size?: string;
}

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    recordsApi.list().then((list) => {
      setRecords(
        list.map((r) => ({
          id: r.id,
          type: r.type as any,
          title: r.title,
          date: new Date(r.date),
          provider: r.providerName,
          size: undefined,
        }))
      );
    }).catch(() => {});
  }, []);

  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredRecords =
    selectedType === 'all'
      ? records
      : records.filter((r) => r.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab':
        return FlaskConical;
      case 'imaging':
        return ImageIcon;
      case 'notes':
        return FileText;
      case 'reports':
        return File;
      case 'prescriptions':
        return Pill;
      default:
        return FileText;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'lab':
        return 'rgba(165,211,207,0.2)';
      case 'imaging':
        return 'rgba(205,173,208,0.2)';
      case 'notes':
        return 'rgba(114,147,187,0.15)';
      case 'reports':
        return 'rgba(242,238,218,0.8)';
      case 'prescriptions':
        return 'rgba(255,228,225,0.8)';
      default:
        return 'rgba(114,147,187,0.15)';
    }
  };

  const getTypeBorderColor = (type: string) => {
    switch (type) {
      case 'lab':
        return '#A5D3CF';
      case 'imaging':
        return '#CDADD0';
      case 'notes':
        return '#7293BB';
      case 'reports':
        return '#F2EEDA';
      case 'prescriptions':
        return '#FF9999';
      default:
        return '#7293BB';
    }
  };

  const storageUsed = 45; // percentage

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Records List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Records</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your health documents in one place
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Pill Tab Navigation */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'lab', label: 'Lab Results' },
                  { value: 'imaging', label: 'Imaging' },
                  { value: 'notes', label: 'Notes' },
                  { value: 'prescriptions', label: 'Prescriptions' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedType(tab.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedType === tab.value
                        ? 'bg-[#7293BB] text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Records List */}
              <div className="space-y-3">
                {filteredRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No records found
                  </p>
                ) : (
                  filteredRecords
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((record) => {
                      const Icon = getTypeIcon(record.type);
                      return (
                        <div
                          key={record.id}
                          className="flex items-center gap-4 p-4 border-l-4 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                          style={{
                            borderLeftColor: getTypeBorderColor(record.type),
                          }}
                        >
                          {/* Icon Badge */}
                          <div
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: getTypeBgColor(record.type),
                            }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{ color: getTypeBorderColor(record.type) }}
                            />
                          </div>

                          {/* Record Info */}
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{record.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {record.date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {record.provider && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {record.provider}
                                </span>
                              )}
                              {record.size && (
                                <span className="text-xs">{record.size}</span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contextual Panels */}
        <div className="space-y-4">
          {/* Export for Doctor */}
          <Card
            className="border-0"
            style={{
              background: 'linear-gradient(135deg, #A5D3CF 0%, #7293BB 100%)',
            }}
          >
            <CardContent className="pt-6">
              <h3 className="text-white font-semibold mb-2">Export for Doctor</h3>
              <p className="text-white/90 text-sm mb-4">
                Prepare your records for your next appointment
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full bg-white/90 hover:bg-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full bg-white/90 hover:bg-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          

          {/* Care Team */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Care Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  name: 'Dr. Sarah Johnson',
                  specialty: 'Rheumatologist',
                  next: 'Apr 20, 2025',
                },
                {
                  name: 'Dr. Michael Chen',
                  specialty: 'Primary Care',
                  next: 'Mar 15, 2025',
                },
              ].map((doctor, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#CDADD0' }}
                  >
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground">
                      Next: {doctor.next}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}