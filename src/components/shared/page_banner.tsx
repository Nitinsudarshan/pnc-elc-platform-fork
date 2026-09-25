import React from "react";

export interface PageBannerProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageBanner({
  title,
  description,
  badge,
  icon: IconOrNode,
  actions,
  className = "",
}: PageBannerProps) {
  // Render icon whether passed as a LucideIcon component or a React element
  const renderIcon = () => {
    if (!IconOrNode) return null;
    if (React.isValidElement(IconOrNode)) {
      return IconOrNode;
    }
    if (typeof IconOrNode === "function" || typeof IconOrNode === "object") {
      const IconComponent = IconOrNode as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    }
    return null;
  };

  return (
    <div
      className={`relative rounded-lg p-2 sm:p-4 bg-card border border-border shadow-xs overflow-hidden group transition-all duration-700 hover:shadow-md ${className}`}
      role="region"
    >
      {/* Background Gradients & Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-card/50 opacity-100 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] bg-[repeating-linear-gradient(45deg,_#000_0,_#000_2px,_transparent_2px,_transparent_8px)] dark:bg-[repeating-linear-gradient(45deg,_#fff_0,_#fff_2px,_transparent_2px,_transparent_8px)] pointer-events-none" />
      <div className="absolute -left-32 -top-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
      <div
        className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000 text-indigo-500"
        style={{ backgroundColor: "currentColor", opacity: 0.15 }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-card/70 backdrop-blur-md p-5 rounded-lg border border-border/60 shadow-xs transition-all duration-700">
        <div className="flex items-center gap-6">
          {IconOrNode && (
            <div className="bg-muted/60 dark:bg-muted/40 p-3.5 rounded-lg shrink-0 shadow-inner border border-border group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
              {renderIcon()}
            </div>
          )}
          <div className="space-y-1">
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 w-fit mb-1">
                {badge}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground transition-all duration-700">
              {title}
            </h1>
            {description && (
              <div className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed max-w-4xl xl:max-w-none transition-all duration-700">
                {description}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-3 w-full sm:w-auto justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageBanner;
