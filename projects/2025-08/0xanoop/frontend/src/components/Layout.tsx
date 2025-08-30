import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  configPanel: React.ReactNode;
  sidebar: React.ReactNode;
  onDeployClick: () => void;
}

export const Layout = ({ children, configPanel, sidebar, onDeployClick }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header onDeployClick={onDeployClick} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          {sidebar}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <main className="h-full">{children}</main>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          {configPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
      <Footer />
    </div>
  );
};