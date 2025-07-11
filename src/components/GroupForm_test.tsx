import { assertEquals, assertExists } from "https://deno.land/std@0.214.0/testing/asserts.ts";
import { render, fireEvent } from "@testing-library/preact";
import { GroupForm } from "./GroupForm.tsx";

Deno.test("GroupForm - renders form fields", () => {
  const { getByLabelText, getByText } = render(<GroupForm onSubmit={() => {}} />);
  
  // Check if the form elements exist
  assertExists(getByLabelText("Group Name"));
  assertExists(getByText("Add Person"));
  assertExists(getByText("Create Group"));
});

Deno.test("GroupForm - can add and remove people", async () => {
  const { getByLabelText, getByText, getAllByText } = render(<GroupForm onSubmit={() => {}} />);
  
  // Add a person
  const nameInput = getByLabelText("Person Name");
  await fireEvent.input(nameInput, { target: { value: "Alice" } });
  await fireEvent.click(getByText("Add Person"));
  
  // Check if the person was added
  assertExists(getByText("Alice"));
  assertExists(getByText("Remove"));
  
  // Add another person
  await fireEvent.input(nameInput, { target: { value: "Bob" } });
  await fireEvent.click(getByText("Add Person"));
  
  // Check if both people are in the list
  assertEquals(getAllByText("Remove").length, 2);
  
  // Remove the first person
  await fireEvent.click(getAllByText("Remove")[0]);
  
  // Check if only one person remains
  assertEquals(getAllByText("Remove").length, 1);
});

Deno.test("GroupForm - submits form with correct data", async () => {
  // Set up a mock submit handler
  const mockSubmit = (data: { name: string; people: string[] }) => {
    assertEquals(data.name, "Trip to Paris");
    assertEquals(data.people, ["Alice", "Bob"]);
  };
  
  const { getByLabelText, getByText } = render(<GroupForm onSubmit={mockSubmit} />);
  
  // Fill in group name
  const groupNameInput = getByLabelText("Group Name");
  await fireEvent.input(groupNameInput, { target: { value: "Trip to Paris" } });
  
  // Add people
  const nameInput = getByLabelText("Person Name");
  
  // Add first person
  await fireEvent.input(nameInput, { target: { value: "Alice" } });
  await fireEvent.click(getByText("Add Person"));
  
  // Add second person
  await fireEvent.input(nameInput, { target: { value: "Bob" } });
  await fireEvent.click(getByText("Add Person"));
  
  // Submit the form
  await fireEvent.click(getByText("Create Group"));
});
