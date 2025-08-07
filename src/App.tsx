import { useEffect } from 'react';
import { AppRouter } from './routes';
import { socketService } from './services/socketService';

function App() {
    useEffect(() => {
        // 앱 시작 시 소켓 연결
        socketService.connect().catch(console.error);

        // 앱 종료 시 소켓 정리
        return () => {
            socketService.disconnect();
        };
    }, []);

    return (
        <div className="w-screen h-screen bg-black flex justify-center items-center overflow-hidden">
            <AppRouter />
        </div>
    );
}

export default App;
