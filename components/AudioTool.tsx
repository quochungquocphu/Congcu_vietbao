import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData, createWavBlob, downloadBlob } from '../utils/audioUtils';
import { type VoiceGender, type VoiceStyle } from '../types';
import { VOICE_GENDERS, VOICE_STYLES } from '../constants';
import { DownloadIcon } from './icons';

interface AudioToolProps {
    initialText: string;
}

export const AudioTool: React.FC<AudioToolProps> = ({ initialText }) => {
    const [gender, setGender] = useState<VoiceGender>('male');
    const [style, setStyle] = useState<VoiceStyle>('news');
    const [lexicon, setLexicon] = useState<string>('');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);

    // Reset audio player when new text is generated
    useEffect(() => {
        setAudioUrl(null);
        setGeneratedBlob(null);
    }, [initialText]);


    const handlePreview = async () => {
        if (!initialText.trim()) {
            setError('Không có nội dung văn bản để chuyển đổi.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAudioUrl(null);
        setGeneratedBlob(null);

        try {
            const base64Audio = await generateSpeech(initialText, gender, style, lexicon);

            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
            );
            
            const wavBlob = createWavBlob(audioBuffer);
            setGeneratedBlob(wavBlob);
            
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi tạo âm thanh: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadWav = () => {
        if (generatedBlob) {
            downloadBlob(generatedBlob, 'audio.wav');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-inner border border-gray-100 space-y-6">
            {/* Section 1: Voice Settings */}
            <div className="p-5 border rounded-lg bg-gray-50/70">
                <h3 className="text-lg font-semibold text-gray-800">1. Cài đặt giọng đọc</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">Chọn giọng đọc (Nam/Nữ) và phong cách thể hiện phù hợp với nội dung.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="voice-gender" className="block text-sm font-medium text-gray-700 mb-1">Giọng đọc:</label>
                        <select 
                            id="voice-gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value as VoiceGender)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {VOICE_GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="voice-style" className="block text-sm font-medium text-gray-700 mb-1">Phong cách:</label>
                        <select
                            id="voice-style"
                            value={style}
                            onChange={(e) => setStyle(e.target.value as VoiceStyle)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {VOICE_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Custom Pronunciation */}
            <div className="p-5 border rounded-lg bg-gray-50/70">
                <h3 className="text-lg font-semibold text-gray-800">2. Hỗ trợ tùy chỉnh phát âm</h3>
                <label htmlFor="custom-lexicon" className="block text-sm text-gray-600 mt-1 mb-4">Giúp AI phát âm đúng các từ viết tắt hoặc từ khó theo định dạng: <code className="bg-gray-200 text-red-600 px-1 rounded">Viết tắt=Đọc là</code>.</label>
                <textarea
                    id="custom-lexicon"
                    rows={5}
                    value={lexicon}
                    onChange={(e) => setLexicon(e.target.value)}
                    placeholder={"Ví dụ:\nTPHCM = Thành phố Hồ Chí Minh\nBTC = Ban tổ chức\nBộ GD&ĐT = Bộ giáo dục và đào tạo"}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                ></textarea>
            </div>

            {/* Section 3: Preview and Download */}
            <div className="p-5 border rounded-lg bg-gray-50/70">
                <h3 className="text-lg font-semibold text-gray-800">3. Nghe thử & Tải xuống</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">Sau khi cài đặt, nhấn nút bên dưới để tạo âm thanh và nghe thử.</p>
                
                <button
                    id="preview-button"
                    onClick={handlePreview}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang tạo âm thanh...
                        </>
                    ) : 'TẠO ÂM THANH & NGHE THỬ'}
                </button>
                
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {audioUrl && (
                     <div className="mt-6 space-y-4">
                        <audio ref={audioRef} id="audio-preview" controls src={audioUrl} className="w-full"></audio>
                        <div className="flex flex-wrap items-center gap-4">
                            <button 
                                id="download-wav" 
                                onClick={handleDownloadWav}
                                disabled={!generatedBlob}
                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon />
                                <span className="ml-2">Tải về .WAV (Nguyên bản)</span>
                            </button>
                            <button id="download-mp3" disabled className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-100 cursor-not-allowed">
                            Tải về .MP3 (Sắp ra mắt)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
