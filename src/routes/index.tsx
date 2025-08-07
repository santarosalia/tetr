import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StartScreen } from '../components/StartScreen';
import { MultiplayerGame } from '../components/MultiplayerGame';

export const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartScreen />} />
                <Route path="/game" element={<MultiplayerGame />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};
