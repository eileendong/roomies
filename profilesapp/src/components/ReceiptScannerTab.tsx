import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Upload, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReceiptItemsSplitter } from "./ReceiptItemsSplitter";
import type { Contact, Receipt, ReceiptItem, Transaction } from "../App";

type ReceiptScannerTabProps = {
  contacts: Contact[];
  onAddReceipt: (receipt: Receipt) => void;
  onAddTransaction: (transaction: Transaction) => void;
};

export function ReceiptScannerTab({ contacts, onAddReceipt, onAddTransaction }: ReceiptScannerTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedReceipt, setScannedReceipt] = useState<Receipt | null>(null);

  // Mock OCR function - in production, this would call an OCR API
  const mockReceiptScan = (): Receipt => {
    const items: ReceiptItem[] = [
      { id: "1", name: "Caesar Salad", price: 12.99, quantity: 2, assignedTo: [] },
      { id: "2", name: "Margherita Pizza", price: 18.50, quantity: 1, assignedTo: [] },
      { id: "3", name: "Spaghetti Carbonara", price: 16.00, quantity: 1, assignedTo: [] },
      { id: "4", name: "Tiramisu", price: 8.50, quantity: 2, assignedTo: [] },
      { id: "5", name: "Coca Cola", price: 3.50, quantity: 3, assignedTo: [] },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const tip = subtotal * 0.18;

    return {
      id: Date.now().toString(),
      date: new Date(),
      merchant: "Italian Garden Restaurant",
      total: subtotal + tax + tip,
      tax,
      tip,
      items,
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const receipt = mockReceiptScan();
    setScannedReceipt(receipt);
    setIsScanning(false);
    toast.success("Receipt scanned successfully!");
  };

  const handleCameraCapture = async () => {
    setIsScanning(true);
    
    // Simulate camera capture and OCR
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const receipt = mockReceiptScan();
    setScannedReceipt(receipt);
    setIsScanning(false);
    toast.success("Receipt captured successfully!");
  };

  const handleFinalizeSplit = (receipt: Receipt) => {
    onAddReceipt(receipt);

    // Calculate splits for each person
    const splitMap = new Map<string, number>();

    receipt.items.forEach((item) => {
      if (item.assignedTo.length === 0) return;
      
      const totalItemCost = item.price * item.quantity;
      const perPersonCost = totalItemCost / item.assignedTo.length;
      
      item.assignedTo.forEach((contactId) => {
        splitMap.set(contactId, (splitMap.get(contactId) || 0) + perPersonCost);
      });
    });

    // Add proportional tax and tip
    const itemsTotal = receipt.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAndTipTotal = receipt.tax + receipt.tip;
    
    splitMap.forEach((amount, contactId) => {
      const proportion = amount / itemsTotal;
      const additionalCost = taxAndTipTotal * proportion;
      splitMap.set(contactId, amount + additionalCost);
    });

    // Create transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "receipt",
      from: "You",
      splits: Array.from(splitMap.entries()).map(([contactId, amount]) => ({
        contactId,
        amount,
      })),
      amount: receipt.total,
      description: `${receipt.merchant} - Receipt`,
      date: new Date(),
      receiptId: receipt.id,
    };

    onAddTransaction(transaction);
    toast.success("Receipt split created!");
    setScannedReceipt(null);
  };

  if (scannedReceipt) {
    return (
      <ReceiptItemsSplitter
        receipt={scannedReceipt}
        contacts={contacts}
        onFinalize={handleFinalizeSplit}
        onCancel={() => setScannedReceipt(null)}
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>
            Take a photo or upload an image of your receipt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-indigo-300 transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              Drag and drop or click to upload
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isScanning}
            />
            <Button asChild disabled={isScanning}>
              <label htmlFor="file-upload" className="cursor-pointer">
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Choose File"
                )}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan with Camera</CardTitle>
          <CardDescription>
            Use your device camera to capture a receipt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-indigo-300 transition-colors">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              Capture receipt with camera
            </p>
            <Button onClick={handleCameraCapture} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <p>Upload or scan your receipt</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll automatically detect items and prices
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <p>Assign items to people</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select who ordered what, split items between multiple people
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <p>Finalize and request payment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tax and tip are split proportionally
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
