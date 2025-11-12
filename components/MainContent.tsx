import React, { useState, useEffect } from 'react';
import { downloadAsDocx, downloadAsTxt } from '../utils/fileUtils';
import { RocketIcon, DownloadIcon } from './icons';
import { AudioTool } from './AudioTool';

interface MainContentProps {
    userInput: string;
    setUserInput: (input: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    result: string;
    error: string | null;
    imagePreview: string | null;
}

export const MainContent: React.FC<MainContentProps> = ({
    userInput,
    setUserInput,
    onGenerate,
    isLoading,
    result,
    error,
    imagePreview,
}) => {
    const [editedTitle, setEditedTitle] = useState('');
    const [articleBody, setArticleBody] = useState('');

    useEffect(() => {
        if (result) {
            const lines = result.split('\n');
            const title = lines.shift() || ''; // Get first line as title
            const body = lines.join('\n'); // The rest is the body
            setEditedTitle(title);
            setArticleBody(body);
        } else {
            setEditedTitle('');
            setArticleBody('');
        }
    }, [result]);

    const handleDownload = (format: 'docx' | 'txt') => {
        const fullContent = `${editedTitle}\n\n${articleBody}`;
        // Sanitize filename: keep letters/numbers from any language, replace spaces with underscores, limit length
        const safeFilename = (editedTitle.trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '_') || 'baiviet_ai').substring(0, 60);

        if (format === 'docx') {
            downloadAsDocx(fullContent, `${safeFilename}.docx`);
        } else {
            downloadAsTxt(fullContent, `${safeFilename}.txt`);
        }
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col flex-grow">
            <div className="flex-grow flex flex-col">
                <label htmlFor="user-input" className="block text-sm font-medium text-gray-700 mb-1">✍️ Nhập yêu cầu hoặc nội dung bài viết:</label>
                <textarea
                    id="user-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ví dụ: Viết bài 300 chữ về Hội nghị tổng kết công tác Mặt trận xã..."
                    className="w-full flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={8}
                />
                {imagePreview && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Ảnh đã tải lên:</p>
                        <img src={imagePreview} alt="Xem trước" className="mt-2 rounded-lg max-h-40 object-contain border border-gray-200" />
                    </div>
                )}
            </div>
            
            <div className="mt-6">
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <RocketIcon />
                            <span className="ml-2">TẠO NỘI DUNG</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            {result && !isLoading && (
                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">✅ Hoàn tất! Dưới đây là bài viết:</h3>
                         <div className="flex space-x-2">
                            <button onClick={() => handleDownload('docx')} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                                <DownloadIcon/>
                                <span className="ml-1">.docx</span>
                            </button>
                            <button onClick={() => handleDownload('txt')} className="flex items-center text-sm text-green-600 hover:text-green-800 font-medium p-2 rounded-md bg-green-50 hover:bg-green-100 transition-colors">
                                <DownloadIcon/>
                                <span className="ml-1">.txt</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="article-title" className="block text-sm font-medium text-gray-900 mb-1">
                                Tiêu đề (có thể chỉnh sửa):
                            </label>
                            <input
                                id="article-title"
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-lg"
                                aria-label="Article Title"
                            />
                        </div>

                        <div>
                            <label htmlFor="article-body" className="block text-sm font-medium text-gray-900 mb-1">
                                Nội dung (có thể chỉnh sửa):
                            </label>
                            <textarea
                                id="article-body"
                                value={articleBody}
                                onChange={(e) => setArticleBody(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md resize-none"
                                rows={15}
                                aria-label="Article Body"
                            />
                        </div>
                    </div>

                    <div className="mt-8 border-t-2 border-gray-100 pt-6">
                         <h2 className="text-2xl font-bold text-sky-600 mb-4 text-center">🎙️ Chuyển bài viết thành âm thanh</h2>
                        <AudioTool initialText={`${editedTitle}\n\n${articleBody}`} />
                    </div>
                </div>
            )}
        </div>
    );
};