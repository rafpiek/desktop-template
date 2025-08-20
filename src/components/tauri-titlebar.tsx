import { getCurrentWindow } from '@tauri-apps/api/window';

export function TauriTitlebar() {
  const handleMinimize = async () => {
    await getCurrentWindow().minimize();
  };

  const handleMaximize = async () => {
    await getCurrentWindow().toggleMaximize();
  };

  const handleClose = async () => {
    await getCurrentWindow().close();
  };

  return (
    <div 
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 z-50 h-8 bg-background/95 select-none flex items-center justify-end"
    >
      {/* Window controls */}
      <div className="flex items-center h-full">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-full hover:bg-muted/30"
        >
          <span className="text-xs">−</span>
        </button>
        
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-10 h-full hover:bg-muted/30"
        >
          <span className="text-xs">□</span>
        </button>
        
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-full hover:bg-red-500 hover:text-white"
        >
          <span className="text-xs">×</span>
        </button>
      </div>
    </div>
  );
}