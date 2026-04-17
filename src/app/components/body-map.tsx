import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface BodyPartSymptom {
  id: string;
  part: string;
  symptoms: string[];
  severity: number;
  date: Date;
}

const bodyParts = [
  // Head and Neck
  { id: 'head', name: 'Head', x: 150, y: 40, width: 60, height: 70 },
  { id: 'neck', name: 'Neck', x: 160, y: 110, width: 40, height: 30 },
  
  // Shoulders
  { id: 'left-shoulder', name: 'Left Shoulder', x: 110, y: 140, width: 50, height: 40 },
  { id: 'right-shoulder', name: 'Right Shoulder', x: 200, y: 140, width: 50, height: 40 },
  
  // Torso
  { id: 'chest', name: 'Chest', x: 140, y: 180, width: 80, height: 70 },
  { id: 'abdomen', name: 'Abdomen', x: 140, y: 250, width: 80, height: 60 },
  
  // Arms and Elbows
  { id: 'left-upper-arm', name: 'Left Upper Arm', x: 80, y: 180, width: 35, height: 50 },
  { id: 'right-upper-arm', name: 'Right Upper Arm', x: 245, y: 180, width: 35, height: 50 },
  { id: 'left-elbow', name: 'Left Elbow', x: 80, y: 230, width: 35, height: 30 },
  { id: 'right-elbow', name: 'Right Elbow', x: 245, y: 230, width: 35, height: 30 },
  { id: 'left-forearm', name: 'Left Forearm', x: 70, y: 260, width: 30, height: 50 },
  { id: 'right-forearm', name: 'Right Forearm', x: 260, y: 260, width: 30, height: 50 },
  
  // Wrists
  { id: 'left-wrist', name: 'Left Wrist', x: 65, y: 310, width: 25, height: 20 },
  { id: 'right-wrist', name: 'Right Wrist', x: 270, y: 310, width: 25, height: 20 },
  
  // Hands and Fingers
  { id: 'left-hand', name: 'Left Palm', x: 55, y: 330, width: 35, height: 30 },
  { id: 'right-hand', name: 'Right Palm', x: 270, y: 330, width: 35, height: 30 },
  { id: 'left-thumb', name: 'Left Thumb', x: 48, y: 340, width: 10, height: 25 },
  { id: 'right-thumb', name: 'Right Thumb', x: 302, y: 340, width: 10, height: 25 },
  { id: 'left-fingers', name: 'Left Fingers', x: 58, y: 360, width: 30, height: 25 },
  { id: 'right-fingers', name: 'Right Fingers', x: 272, y: 360, width: 30, height: 25 },
  
  // Hips
  { id: 'left-hip', name: 'Left Hip', x: 130, y: 310, width: 40, height: 50 },
  { id: 'right-hip', name: 'Right Hip', x: 190, y: 310, width: 40, height: 50 },
  
  // Thighs
  { id: 'left-thigh', name: 'Left Thigh', x: 120, y: 360, width: 45, height: 80 },
  { id: 'right-thigh', name: 'Right Thigh', x: 195, y: 360, width: 45, height: 80 },
  
  // Knees
  { id: 'left-knee', name: 'Left Knee', x: 125, y: 440, width: 40, height: 35 },
  { id: 'right-knee', name: 'Right Knee', x: 195, y: 440, width: 40, height: 35 },
  
  // Lower Legs
  { id: 'left-shin', name: 'Left Shin', x: 125, y: 475, width: 35, height: 70 },
  { id: 'right-shin', name: 'Right Shin', x: 200, y: 475, width: 35, height: 70 },
  
  // Ankles
  { id: 'left-ankle', name: 'Left Ankle', x: 125, y: 545, width: 35, height: 25 },
  { id: 'right-ankle', name: 'Right Ankle', x: 200, y: 545, width: 35, height: 25 },
  
  // Feet and Toes
  { id: 'left-foot', name: 'Left Foot', x: 115, y: 570, width: 45, height: 25 },
  { id: 'right-foot', name: 'Right Foot', x: 200, y: 570, width: 45, height: 25 },
  { id: 'left-toes', name: 'Left Toes', x: 115, y: 595, width: 45, height: 15 },
  { id: 'right-toes', name: 'Right Toes', x: 200, y: 595, width: 45, height: 15 },
  
  // Spine/Back
  { id: 'upper-back', name: 'Upper Back', x: 155, y: 150, width: 50, height: 60 },
  { id: 'lower-back', name: 'Lower Back', x: 155, y: 250, width: 50, height: 60 },
];

export function BodyMap() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<BodyPartSymptom[]>([
    {
      id: '1',
      part: 'left-knee',
      symptoms: ['Pain', 'Swelling'],
      severity: 7,
      date: new Date(),
    },
    {
      id: '2',
      part: 'right-hand',
      symptoms: ['Stiffness', 'Pain'],
      severity: 5,
      date: new Date(),
    },
    {
      id: '3',
      part: 'left-fingers',
      symptoms: ['Stiffness'],
      severity: 6,
      date: new Date(),
    },
  ]);

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#E89BA1';
    if (severity >= 5) return '#F59E0B';
    return '#A5D3CF';
  };

  const getPartSymptoms = (partId: string) => {
    return symptoms.filter((s) => s.part === partId);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id));
  };

  // Helper component to draw natural-looking bones
  const Bone = ({ x1, y1, x2, y2, thickness = 10 }: { x1: number, y1: number, x2: number, y2: number, thickness?: number }) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    const rEnd = thickness / 2;
    const rShaft = thickness / 3;
    const sStart = Math.min(rEnd * 1.5, length / 2);
    const sEnd = Math.max(length - rEnd * 1.5, length / 2);
    
    const pathData = `
      M 0,${-rEnd}
      A ${rEnd} ${rEnd} 0 0 0 0,${rEnd}
      C ${rEnd},${rEnd} ${rEnd},${rShaft} ${sStart},${rShaft}
      L ${sEnd},${rShaft}
      C ${length - rEnd},${rShaft} ${length - rEnd},${rEnd} ${length},${rEnd}
      A ${rEnd} ${rEnd} 0 0 0 ${length},${-rEnd}
      C ${length - rEnd},${-rEnd} ${length - rEnd},${-rShaft} ${sEnd},${-rShaft}
      L ${sStart},${-rShaft}
      C ${rEnd},${-rShaft} ${rEnd},${-rEnd} 0,${-rEnd}
      Z
    `;
    
    return (
      <g transform={`translate(${x1}, ${y1}) rotate(${angle})`}>
        <path d={pathData} fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Body Mapping</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track where you experience symptoms - click on any body part
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Body diagram */}
          <div className="flex-1 flex justify-center">
            <svg
              viewBox="0 0 360 620"
              className="w-full max-w-md"
              style={{ maxHeight: '650px' }}
            >
              {/* Detailed human skeleton with highlighted joints */}
              <g className="skeleton" stroke="#7293BB" strokeWidth="1.5" fill="none">
                {/* 1. STRUCTURAL BONES */}
                <g id="structural-bones">
                  {/* Skull */}
                  <path d="M 180 25 C 150 25 150 55 152 65 C 153 72 158 75 160 85 C 162 95 170 95 180 95 C 190 95 198 95 200 85 C 202 75 207 72 208 65 C 210 55 210 25 180 25 Z" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M 162 55 C 162 50 172 50 172 55 C 172 62 162 62 162 55 Z" fill="#7293BB" opacity="0.6" />
                  <path d="M 198 55 C 198 50 188 50 188 55 C 188 62 198 62 198 55 Z" fill="#7293BB" opacity="0.6" />
                  <path d="M 180 65 L 176 75 C 176 78 184 78 184 75 Z" fill="#7293BB" opacity="0.6" />
                  <path d="M 165 82 Q 180 85 195 82" stroke="#7293BB" strokeWidth="1" fill="none" />
                  <line x1="170" y1="80" x2="170" y2="85" stroke="#7293BB" strokeWidth="1" />
                  <line x1="175" y1="80" x2="175" y2="86" stroke="#7293BB" strokeWidth="1" />
                  <line x1="180" y1="80" x2="180" y2="86" stroke="#7293BB" strokeWidth="1" />
                  <line x1="185" y1="80" x2="185" y2="86" stroke="#7293BB" strokeWidth="1" />
                  <line x1="190" y1="80" x2="190" y2="85" stroke="#7293BB" strokeWidth="1" />

                  {/* Spine Vertebrae */}
                  {[95, 105, 115, 125, 150, 165, 180, 195, 210, 225, 245, 260, 275, 290].map((y) => (
                    <rect key={y} x={172} y={y - 5} width={16} height={10} rx="3" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" />
                  ))}

                  {/* Ribcage */}
                  <g id="ribcage" opacity="0.8">
                    {/* Ribs Outlines */}
                    <g stroke="#7293BB" strokeWidth="6" fill="none" strokeLinecap="round">
                      <path d="M 180 150 C 150 150 135 165 145 175 C 155 180 170 165 178 155" />
                      <path d="M 180 150 C 210 150 225 165 215 175 C 205 180 190 165 182 155" />
                      <path d="M 180 165 C 145 165 130 185 140 195 C 150 200 168 185 178 170" />
                      <path d="M 180 165 C 215 165 230 185 220 195 C 210 200 192 185 182 170" />
                      <path d="M 180 180 C 140 180 125 205 138 215 C 148 220 168 200 178 185" />
                      <path d="M 180 180 C 220 180 235 205 222 215 C 212 220 192 200 182 185" />
                      <path d="M 180 195 C 135 195 125 225 140 232 C 150 235 168 215 178 200" />
                      <path d="M 180 195 C 225 195 235 225 220 232 C 210 235 192 215 182 200" />
                    </g>
                    {/* Ribs Fills */}
                    <g stroke="#F2EEDA" strokeWidth="3" fill="none" strokeLinecap="round">
                      <path d="M 180 150 C 150 150 135 165 145 175 C 155 180 170 165 178 155" />
                      <path d="M 180 150 C 210 150 225 165 215 175 C 205 180 190 165 182 155" />
                      <path d="M 180 165 C 145 165 130 185 140 195 C 150 200 168 185 178 170" />
                      <path d="M 180 165 C 215 165 230 185 220 195 C 210 200 192 185 182 170" />
                      <path d="M 180 180 C 140 180 125 205 138 215 C 148 220 168 200 178 185" />
                      <path d="M 180 180 C 220 180 235 205 222 215 C 212 220 192 200 182 185" />
                      <path d="M 180 195 C 135 195 125 225 140 232 C 150 235 168 215 178 200" />
                      <path d="M 180 195 C 225 195 235 225 220 232 C 210 235 192 215 182 200" />
                    </g>
                    {/* Sternum */}
                    <path d="M 175 135 L 185 135 L 182 220 L 180 225 L 178 220 Z" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" strokeLinejoin="round" />
                  </g>

                  {/* Clavicles */}
                  <Bone x1={175} y1={135} x2={140} y2={140} thickness={8} />
                  <Bone x1={185} y1={135} x2={220} y2={140} thickness={8} />

                  {/* Pelvis */}
                  <g id="pelvis">
                    <path d="M 180 290 C 160 285 130 290 130 310 C 130 325 145 330 155 335 L 165 350 L 180 350 L 180 330 C 170 325 150 320 155 305 C 160 295 170 300 180 300 Z" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M 180 290 C 200 285 230 290 230 310 C 230 325 215 330 205 335 L 195 350 L 180 350 L 180 330 C 190 325 210 320 205 305 C 200 295 190 300 180 300 Z" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M 170 290 L 190 290 L 180 320 Z" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" strokeLinejoin="round" />
                  </g>

                  {/* LEFT ARM */}
                  <Bone x1={140} y1={140} x2={100} y2={215} thickness={14} />
                  <Bone x1={98} y1={215} x2={76} y2={290} thickness={8} />
                  <Bone x1={102} y1={215} x2={80} y2={290} thickness={8} />

                  {/* LEFT HAND */}
                  <rect x="66" y="295" width="24" height="8" rx="4" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" />
                  <Bone x1={68} y1={303} x2={65} y2={335} thickness={5} />
                  <Bone x1={73} y1={303} x2={73} y2={338} thickness={5} />
                  <Bone x1={78} y1={303} x2={80} y2={338} thickness={5} />
                  <Bone x1={83} y1={303} x2={86} y2={335} thickness={5} />
                  <Bone x1={68} y1={310} x2={58} y2={330} thickness={5} />
                  <Bone x1={65} y1={335} x2={63} y2={350} thickness={4.5} />
                  <Bone x1={73} y1={338} x2={73} y2={355} thickness={4.5} />
                  <Bone x1={80} y1={338} x2={81} y2={354} thickness={4.5} />
                  <Bone x1={86} y1={335} x2={87} y2={349} thickness={4.5} />
                  <Bone x1={58} y1={330} x2={55} y2={343} thickness={4.5} />
                  <Bone x1={63} y1={350} x2={62} y2={362} thickness={4} />
                  <Bone x1={73} y1={355} x2={73} y2={368} thickness={4} />
                  <Bone x1={81} y1={354} x2={81} y2={366} thickness={4} />
                  <Bone x1={87} y1={349} x2={87} y2={360} thickness={4} />
                  <Bone x1={62} y1={362} x2={61} y2={370} thickness={3.5} />
                  <Bone x1={73} y1={368} x2={73} y2={377} thickness={3.5} />
                  <Bone x1={81} y1={366} x2={81} y2={374} thickness={3.5} />
                  <Bone x1={87} y1={360} x2={87} y2={368} thickness={3.5} />
                  <Bone x1={55} y1={343} x2={54} y2={352} thickness={3.5} />

                  {/* RIGHT ARM */}
                  <Bone x1={220} y1={140} x2={260} y2={215} thickness={14} />
                  <Bone x1={262} y1={215} x2={284} y2={290} thickness={8} />
                  <Bone x1={258} y1={215} x2={280} y2={290} thickness={8} />

                  {/* RIGHT HAND */}
                  <rect x="270" y="295" width="24" height="8" rx="4" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" />
                  <Bone x1={292} y1={303} x2={295} y2={335} thickness={5} />
                  <Bone x1={287} y1={303} x2={287} y2={338} thickness={5} />
                  <Bone x1={282} y1={303} x2={280} y2={338} thickness={5} />
                  <Bone x1={277} y1={303} x2={274} y2={335} thickness={5} />
                  <Bone x1={292} y1={310} x2={302} y2={330} thickness={5} />
                  <Bone x1={295} y1={335} x2={297} y2={350} thickness={4.5} />
                  <Bone x1={287} y1={338} x2={287} y2={355} thickness={4.5} />
                  <Bone x1={280} y1={338} x2={279} y2={354} thickness={4.5} />
                  <Bone x1={274} y1={335} x2={273} y2={349} thickness={4.5} />
                  <Bone x1={302} y1={330} x2={305} y2={343} thickness={4.5} />
                  <Bone x1={297} y1={350} x2={298} y2={362} thickness={4} />
                  <Bone x1={287} y1={355} x2={287} y2={368} thickness={4} />
                  <Bone x1={279} y1={354} x2={279} y2={366} thickness={4} />
                  <Bone x1={273} y1={349} x2={273} y2={360} thickness={4} />
                  <Bone x1={298} y1={362} x2={299} y2={370} thickness={3.5} />
                  <Bone x1={287} y1={368} x2={287} y2={377} thickness={3.5} />
                  <Bone x1={279} y1={366} x2={279} y2={374} thickness={3.5} />
                  <Bone x1={273} y1={360} x2={273} y2={368} thickness={3.5} />
                  <Bone x1={305} y1={343} x2={306} y2={352} thickness={3.5} />

                  {/* LEFT LEG */}
                  <Bone x1={155} y1={315} x2={147} y2={440} thickness={16} />
                  <Bone x1={145} y1={440} x2={140} y2={545} thickness={12} />
                  <Bone x1={149} y1={440} x2={144} y2={545} thickness={6} />

                  {/* LEFT FOOT */}
                  <ellipse cx="140" cy="555" rx="18" ry="10" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" />
                  <Bone x1={125} y1={565} x2={122} y2={585} thickness={5} />
                  <Bone x1={132} y1={565} x2={130} y2={587} thickness={5} />
                  <Bone x1={140} y1={565} x2={140} y2={590} thickness={5} />
                  <Bone x1={148} y1={565} x2={150} y2={587} thickness={5} />
                  <Bone x1={155} y1={565} x2={158} y2={585} thickness={5} />
                  <Bone x1={122} y1={585} x2={120} y2={598} thickness={4} />
                  <Bone x1={130} y1={587} x2={128} y2={602} thickness={4} />
                  <Bone x1={140} y1={590} x2={140} y2={606} thickness={4} />
                  <Bone x1={150} y1={587} x2={152} y2={602} thickness={4} />
                  <Bone x1={158} y1={585} x2={160} y2={598} thickness={4} />

                  {/* RIGHT LEG */}
                  <Bone x1={205} y1={315} x2={213} y2={440} thickness={16} />
                  <Bone x1={215} y1={440} x2={220} y2={545} thickness={12} />
                  <Bone x1={211} y1={440} x2={216} y2={545} thickness={6} />

                  {/* RIGHT FOOT */}
                  <ellipse cx="220" cy="555" rx="18" ry="10" fill="#F2EEDA" stroke="#7293BB" strokeWidth="1.5" />
                  <Bone x1={205} y1={565} x2={202} y2={585} thickness={5} />
                  <Bone x1={212} y1={565} x2={210} y2={587} thickness={5} />
                  <Bone x1={220} y1={565} x2={220} y2={590} thickness={5} />
                  <Bone x1={228} y1={565} x2={230} y2={587} thickness={5} />
                  <Bone x1={235} y1={565} x2={238} y2={585} thickness={5} />
                  <Bone x1={202} y1={585} x2={200} y2={598} thickness={4} />
                  <Bone x1={210} y1={587} x2={208} y2={602} thickness={4} />
                  <Bone x1={220} y1={590} x2={220} y2={606} thickness={4} />
                  <Bone x1={230} y1={587} x2={232} y2={602} thickness={4} />
                  <Bone x1={238} y1={585} x2={240} y2={598} thickness={4} />
                </g>

                {/* 2. HIGHLIGHTED JOINTS (sit on top of structural bones) */}
                <g id="highlighted-joints">
                  {/* Cervical */}
                  <circle cx="180" cy="95" r="5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="180" cy="105" r="5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="180" cy="115" r="5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="180" cy="125" r="5" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2" />
                  
                  {/* Shoulders */}
                  <circle cx="140" cy="140" r="13" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="220" cy="140" r="13" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  
                  {/* Spine */}
                  <circle cx="180" cy="150" r="4" fill="#CDADD0" opacity="0.5" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="180" cy="165" r="4" fill="#CDADD0" opacity="0.5" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="180" cy="180" r="4" fill="#CDADD0" opacity="0.5" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="180" cy="195" r="4" fill="#CDADD0" opacity="0.5" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="180" cy="210" r="4" fill="#CDADD0" opacity="0.5" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="180" cy="225" r="4" fill="#CDADD0" opacity="0.5" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="180" cy="245" r="5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="180" cy="260" r="5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="180" cy="275" r="5" fill="#CDADD0" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="180" cy="290" r="5" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2" />
                  
                  {/* SI Joints */}
                  <circle cx="165" cy="298" r="9" fill="#B48CBF" opacity="0.8" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="195" cy="298" r="9" fill="#B48CBF" opacity="0.8" stroke="#7293BB" strokeWidth="2.5" />
                  
                  {/* Left Arm/Hand Joints */}
                  <circle cx="100" cy="215" r="11" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="78" cy="290" r="9" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="65" cy="335" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="73" cy="338" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="80" cy="338" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="86" cy="335" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="61" cy="370" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="73" cy="377" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="81" cy="374" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="87" cy="368" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="54" cy="352" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  
                  {/* Right Arm/Hand Joints */}
                  <circle cx="260" cy="215" r="11" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="282" cy="290" r="9" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="295" cy="335" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="287" cy="338" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="280" cy="338" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="274" cy="335" r="4" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="1.5" />
                  <circle cx="299" cy="370" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="287" cy="377" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="279" cy="374" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="273" cy="368" r="3.5" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="306" cy="352" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  
                  {/* Left Leg/Foot Joints */}
                  <circle cx="155" cy="315" r="12" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="147" cy="440" r="13" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="142" cy="545" r="10" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="120" cy="598" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="128" cy="602" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="140" cy="606" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="152" cy="602" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="160" cy="598" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  
                  {/* Right Leg/Foot Joints */}
                  <circle cx="205" cy="315" r="12" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="213" cy="440" r="13" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="218" cy="545" r="10" fill="#B48CBF" opacity="0.7" stroke="#7293BB" strokeWidth="2.5" />
                  <circle cx="200" cy="598" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="208" cy="602" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="220" cy="606" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="232" cy="602" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                  <circle cx="240" cy="598" r="3" fill="#CDADD0" opacity="0.6" stroke="#7293BB" strokeWidth="1" />
                </g>
              </g>

              {/* Interactive body parts overlay */}
              {bodyParts.map((part) => {
                const partSymptoms = getPartSymptoms(part.id);
                const hasSymptoms = partSymptoms.length > 0;
                const maxSeverity = hasSymptoms
                  ? Math.max(...partSymptoms.map((s) => s.severity))
                  : 0;

                return (
                  <g key={part.id}>
                    <rect
                      x={part.x}
                      y={part.y}
                      width={part.width}
                      height={part.height}
                      rx="8"
                      fill={
                        hasSymptoms ? getSeverityColor(maxSeverity) : 'transparent'
                      }
                      opacity={hasSymptoms ? 0.5 : 0}
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => setSelectedPart(part.id)}
                    />
                    {hasSymptoms && (
                      <circle
                        cx={part.x + part.width / 2}
                        cy={part.y + part.height / 2}
                        r="6"
                        fill={getSeverityColor(maxSeverity)}
                        className="cursor-pointer animate-pulse"
                        onClick={() => setSelectedPart(part.id)}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Symptom details */}
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="mb-3">Active Symptoms</h4>
              {symptoms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No symptoms logged. Click on a body part to add symptoms.
                </p>
              ) : (
                <div className="space-y-3">
                  {symptoms.map((symptom) => {
                    const part = bodyParts.find((p) => p.id === symptom.part);
                    return (
                      <div
                        key={symptom.id}
                        className="p-3 bg-card rounded-lg border flex items-start justify-between"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{part?.name}</span>
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: getSeverityColor(symptom.severity),
                                color: 'white',
                                borderColor: getSeverityColor(symptom.severity),
                              }}
                            >
                              Severity {symptom.severity}/10
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {symptom.symptoms.map((s, idx) => (
                              <Badge key={idx} variant="secondary">
                                {s}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {symptom.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSymptom(symptom.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="mb-2">Severity Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#A5D3CF' }}
                  />
                  <span>Mild (1-4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#F59E0B' }}
                  />
                  <span>Moderate (5-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#E89BA1' }}
                  />
                  <span>Severe (8-10)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}