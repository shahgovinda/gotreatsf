import { useState, useEffect } from "react";
// react-router-dom, react-query, react-hot-toast, aur anya dependencies ko is demo mein hataya gaya hai
// taki code bina errors ke run ho sake.

// CustomCursor.tsx के लिए कोड
const CustomCursor = () => {
    // कर्सर की स्थिति के लिए टाइपस्क्रिप्ट इंटरफ़ेस
    interface CursorPosition {
        x: number;
        y: number;
    }

    // स्थिति को useState हुक का उपयोग करके ट्रैक करें
    const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });

    useEffect(() => {
        // माउस की गति को संभालने के लिए फ़ंक्शन
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        
        // माउस गति इवेंट लिसनर जोड़ें
        window.addEventListener('mousemove', handleMouseMove);
        
        // कंपोनेंट अनमाउंट होने पर लिसनर हटाएँ
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // खाली निर्भरता ऐरे का मतलब है कि यह केवल एक बार चलेगा

    // दो कर्सर तत्वों को रेंडर करें
    return (
        <>
            {/* छोटा काला बिंदु */}
            <div className="dot-cursor" style={{ left: `${position.x}px`, top: `${position.y}px` }}></div>
            
            {/* बड़ा पारदर्शी रिंग */}
            <div className="ring-cursor" style={{ left: `${position.x}px`, top: `${position.y}px` }}></div>
        </>
    );
};
