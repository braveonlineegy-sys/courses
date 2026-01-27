import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLevel, updateLevel } from "shared";
import { useLevel } from "@/hooks/use-level";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type LevelType } from "@/hooks/use-level";

interface LevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level?: LevelType | null;
  departmentId: string;
}

export function LevelDialog({
  open,
  onOpenChange,
  level,
  departmentId,
}: LevelDialogProps) {
  const isEditing = !!level;
  const { createMutation, updateMutation } = useLevel();

  const form = useForm({
    resolver: zodResolver(isEditing ? updateLevel : createLevel),
    defaultValues: isEditing
      ? {
          name: level?.name,
          order: level?.order,
          departmentId: level?.departmentId,
        }
      : {
          id: "", // Will be set on submit
          name: "",
          order: 0,
          departmentId: departmentId,
        },
  });

  // Reset form when dialog opens/closes or level changes
  useEffect(() => {
    if (open) {
      form.reset(
        isEditing
          ? {
              name: level?.name,
              order: level?.order,
              departmentId: level?.departmentId,
            }
          : {
              id: uuidv4(),
              name: "",
              order: 0,
              departmentId: departmentId,
            },
      );
    }
  }, [open, level, departmentId, isEditing, form]);

  const onSubmit = (values: any) => {
    const options = {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    };

    if (isEditing && level) {
      updateMutation.mutate({ id: level.id, json: values }, options);
    } else {
      // Ensure ID is present if not already
      if (!values.id) values.id = uuidv4();
      createMutation.mutate(values, options);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Level" : "Create New Level"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update level details."
              : "Add a new level to this department."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Level 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Field */}
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
