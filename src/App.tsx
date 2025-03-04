import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button, Modal, Input, Row, Flex } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const client = generateClient<Schema>();

function App() {
  const [notes, setNotes] = useState<Array<Schema["Note"]["type"]>>([]);
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [note, setNote] = useState<Schema["Note"]["type"]>();
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Note.observeQuery().subscribe({
      next: (data) => setNotes([...data.items]),
    });
  }, []);

  function showModalCreate() {
    setIsModalOpen(true);
  }

  function showModalUpdate(id: string) {
    const note = notes.find((note) => note.id === id);
    setNote(note);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsModalOpen(true);
    } else {
      console.log("Note not found");
    }
  }

  function handleCancel() {
    setNote(undefined);
    setIsModalOpen(false);
  }

  function handleCreate() {
    if (note) {
      client.models.Note.update({ id: note.id, title, content });
    } else {
      client.models.Note.create({ title, content });
    }
    setTitle("");
    setContent("");
    setIsModalOpen(false);
  }

  function deleteNote(id: string) {
    if (id) {
      client.models.Note.delete({ id: id });
    }
  }
  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Notes App</h1>
      <Button onClick={showModalCreate}>+ new</Button>
      <Modal
        title="Note"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={handleCancel}
      >
        <Input
          id="title"
          placeholder="Enter title"
          value={title}
          onChange={(x) => setTitle(x.target.value)}
        />
        <Input
          id="content"
          placeholder="Enter Content"
          value={content}
          onChange={(x) => setContent(x.target.value)}
        />
      </Modal>
      <ul>
        {notes.map((note) => (
          <div className="list_wrapper">
            <li onClick={() => showModalUpdate(note.id)} key={note.id}>
              {note.title}
            </li>
            <CloseOutlined style={{flexGrow:"1"}} />
          </div>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new note.
        <br />
      </div>
      <button onClick={signOut}> Sign out</button>
    </main>
  );
}

export default App;
