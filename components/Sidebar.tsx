import React from 'react';
import { type ContentMode, type ContentTone } from '../types';
import { MODES, TONES } from '../constants';
import { UploadIcon, GearIcon } from './icons';

interface SidebarProps {
    mode: ContentMode;
    setMode: (mode: ContentMode) => void;
    tone: ContentTone;
    setTone: (tone: ContentTone) => void;
    length: number;
    setLength: (length: number) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fileName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    mode,
    setMode,
    tone,
    setTone,
    length,
    setLength,
    onFileChange,
    fileName,
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6 h-full">
            <h2 className="text-xl font-bold text-blue-600 border-b pb-2 flex items-center">
                <GearIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <span>Tùy chọn công cụ</span>
            </h2>

            <div>
                <label htmlFor="content-type" className="block text-sm font-medium text-gray-700 mb-1">Chọn loại nội dung</label>
                <select
                    id="content-type"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as ContentMode)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">Phong cách thể hiện</label>
                <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ContentTone)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Độ dài (từ): <span className="font-bold text-indigo-600">{length}</span></label>
                <input
                    id="length"
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Tải nội dung</label>
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 border border-gray-300 p-2 flex items-center justify-center">
                    <UploadIcon />
                    <span className="ml-2">Chọn file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} accept=".txt,.jpg,.jpeg,.png,.doc,.docx,.pdf" />
                </label>
                {fileName && <p className="text-xs text-gray-500 mt-2 truncate">File đã chọn: {fileName}</p>}
                 <p className="text-xs text-gray-500 mt-1">Hỗ trợ: .txt, .doc, .docx, .pdf, .jpg, .png</p>
            </div>
        </div>
    );
};