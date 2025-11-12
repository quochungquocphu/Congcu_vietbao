import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { generateJournalistContent } from './services/geminiService';
import { fileToBase64, readTextFile, readDocxFile, readPdfFile } from './utils/fileUtils';
import { type ContentMode, type ContentTone } from './types';
import { MODES, TONES } from './constants';

const App: React.FC = () => {
    const [mode, setMode] = useState<ContentMode>(MODES[0]);
    const [tone, setTone] = useState<ContentTone>(TONES[0]);
    const [length, setLength] = useState<number>(300);
    const [userInput, setUserInput] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setImagePreview(null);
            }
        } else {
            setUploadedFile(null);
            setImagePreview(null);
        }
    };

    const handleGenerate = async () => {
        if (!userInput && !uploadedFile) {
            setError("⚠️ Vui lòng nhập nội dung hoặc tải file lên.");
            return;
        }

        setIsLoading(true);
        setResult('');
        setError(null);

        try {
            let fileContent = '';
            let imageBase64: { mimeType: string; data: string } | null = null;
            
            if (uploadedFile) {
                const fileName = uploadedFile.name.toLowerCase();
                if (uploadedFile.type.startsWith('image/')) {
                    const { data, mimeType } = await fileToBase64(uploadedFile);
                    imageBase64 = { data, mimeType };
                    fileContent = "Hãy viết bài báo dựa trên nội dung của hình ảnh này.";
                } else if (fileName.endsWith('.txt')) {
                    fileContent = await readTextFile(uploadedFile);
                } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
                    fileContent = await readDocxFile(uploadedFile);
                } else if (fileName.endsWith('.pdf')) {
                    fileContent = await readPdfFile(uploadedFile);
                } else {
                     setError("Định dạng file không được hỗ trợ. Vui lòng tải file .txt, .doc, .docx, .pdf hoặc ảnh.");
                     setIsLoading(false);
                     return;
                }
            }
            
            const combinedInput = `${userInput}\n\n${fileContent}`.trim();

            const generatedText = await generateJournalistContent(
                { mode, tone, length },
                combinedInput,
                imageBase64
            );

            setResult(generatedText);
        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi tạo nội dung: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
            <header className="bg-sky-500 shadow-md">
                 <div className="container mx-auto text-center py-4">
                    <h1 className="text-3xl font-bold text-white">VIẾT NỘI DUNG BÁO CHÍ</h1>
                    <p className="text-md text-sky-100 mt-1">Hỗ trợ viết tin, bài, kịch bản và tạo âm thanh phóng sự hiện đại.</p>
                </div>
            </header>
            <div className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    <aside className="lg:col-span-3">
                        <Sidebar
                            mode={mode}
                            setMode={setMode}
                            tone={tone}
                            setTone={setTone}
                            length={length}
                            setLength={setLength}
                            onFileChange={handleFileChange}
                            fileName={uploadedFile?.name}
                        />
                    </aside>
                    <main className="lg:col-span-9 flex flex-col">
                        <MainContent
                            userInput={userInput}
                            setUserInput={setUserInput}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                            result={result}
                            error={error}
                            imagePreview={imagePreview}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;
