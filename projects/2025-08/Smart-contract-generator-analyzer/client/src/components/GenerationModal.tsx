interface GenerationModalProps {
  isOpen: boolean;
}

export default function GenerationModal({ isOpen }: GenerationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-magic text-primary text-2xl animate-pulse-slow"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">Generating Your Contract</h3>
          <p className="text-muted-foreground mb-6">
            AI is analyzing your requirements and generating optimized Solidity code...
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-check text-primary-foreground text-xs"></i>
              </div>
              <span className="text-sm">Parsing natural language input</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-check text-primary-foreground text-xs"></i>
              </div>
              <span className="text-sm">Generating contract structure</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center shimmer">
                <i className="fas fa-spinner fa-spin text-muted-foreground text-xs"></i>
              </div>
              <span className="text-sm">Applying security best practices</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-xs">4</span>
              </div>
              <span className="text-sm text-muted-foreground">Optimizing gas efficiency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
