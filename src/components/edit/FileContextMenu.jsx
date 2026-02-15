import React, { useRef, useEffect } from 'react';
import builtinScripts from '../../scripts/builtinScripts';
import useScriptStore from '../../store/useScriptStore';
import { runScript } from '../../scripts/scriptRunner';

export default function FileContextMenu({ x, y, node, onClose, onRename, onDelete }) {
  const ref = useRef(null);
  const userScripts = useScriptStore((s) => s.userScripts);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const allScripts = [...builtinScripts, ...userScripts];

  // Filter by node type
  const applicable = allScripts.filter((script) => {
    if (node.type === 'dir') {
      return script.context === 'folder' || script.context === 'both';
    }
    if (node.type === 'file') {
      return script.context === 'file' || script.context === 'both';
    }
    return false;
  });

  // Built-in actions
  const builtinActions = [];
  if (onRename) builtinActions.push({ id: '_rename', name: 'Rename', action: () => onRename(node) });
  if (onDelete) builtinActions.push({ id: '_delete', name: 'Delete', action: () => onDelete(node), color: '#DC2626' });

  const totalItems = builtinActions.length + applicable.length;
  if (totalItems === 0) return null;

  // Clamp to viewport
  const menuWidth = 200;
  const separatorHeight = builtinActions.length > 0 && applicable.length > 0 ? 9 : 0;
  const menuHeight = totalItems * 28 + 8 + separatorHeight;
  const left = Math.min(Math.max(x, 4), window.innerWidth - menuWidth - 4);
  const top = Math.min(Math.max(y, 4), window.innerHeight - menuHeight - 4);

  const itemStyle = {
    padding: '5px 12px',
    fontSize: '11px',
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 500,
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top,
        left,
        zIndex: 70,
        width: menuWidth,
        background: '#FFFFFF',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        padding: '4px 0',
      }}
    >
      {builtinActions.map((action) => (
        <div
          key={action.id}
          onClick={() => { onClose(); action.action(); }}
          style={{ ...itemStyle, color: action.color || itemStyle.color }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {action.name}
        </div>
      ))}
      {builtinActions.length > 0 && applicable.length > 0 && (
        <div style={{ borderTop: '1px solid #E5E7EB', margin: '4px 0' }} />
      )}
      {applicable.map((script) => (
        <div
          key={script.id}
          onClick={() => {
            onClose();
            runScript(script, { selectedNode: node });
          }}
          style={itemStyle}
          title={script.description || ''}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {script.name}
        </div>
      ))}
    </div>
  );
}
