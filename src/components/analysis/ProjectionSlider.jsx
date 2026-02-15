import React from 'react';
import useAppStore from '../../store/useAppStore';

export default function ProjectionSlider({ projectedScore }) {
  const { projectionPercent, setProjectionPercent } = useAppStore();

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-purple-300">Revision Projection</h3>
        {projectedScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300">Projected Score:</span>
            <span className={`text-lg font-bold ${
              projectedScore >= 75 ? 'text-green-400' :
              projectedScore >= 50 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {projectedScore}/100
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-purple-300 w-16">Actual</span>
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={projectionPercent}
            onChange={(e) => setProjectionPercent(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-purple-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        <span className="text-xs text-purple-300 w-16 text-right">Ideal</span>
      </div>
      <p className="text-[10px] text-purple-400 mt-2 text-center">
        Drag to preview how your story would look with {projectionPercent}% of recommended changes applied
      </p>
    </div>
  );
}
