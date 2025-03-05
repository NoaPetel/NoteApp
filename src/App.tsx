import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button, Modal, Input } from "antd";
import { CloseOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";

const client = generateClient<Schema>();

function App() {
  const [notes, setNotes] = useState<Array<Schema["Note"]["type"]>>([]);
  const [tags, setTags] = useState<Array<Schema["Tag"]["type"]>>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tagTitle, setTagTitle] = useState<string>("");
 
  const [note, setNote] = useState<Schema["Note"]["type"]>();
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Note.observeQuery().subscribe({
      next: (data) => setNotes([...data.items]),
    });
    client.models.Tag.observeQuery().subscribe({
      next: (data) => setTags([...data.items]),
      error: (error) =>  console.error("Error fetching tags", error),
    });
  }, []);

  function showModalCreate() {
    setIsModalOpen(true);
  }

  function showModalUpdate(id: string) {
    const note = notes.find((note) => note.id === id);
    setNote(note);
    if (note) {
      setTitle(note?.title || "");
      setContent(note.content ? note.content: "");
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

  function addToFavorite() {
    client.models.Note.update({id: note.id, favorite: !note?.favorite})
  }

  function applyFilters() {
    setIsFiltered(!isFiltered)
  }

  function createTag(){
    client.models.Tag.create({ title: tagTitle })
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Notes App</h1>
      
      <div className="tag_div">
        <Input 
        id="tagTitle"
        placeholder="New tag"
        value={tagTitle}
        onChange={ x => setTagTitle(x.target.value) } 
        />
        <Button onClick={createTag}> Create Tag </Button>
        <ul>
          {tags.map( tag => 
          <li className="tag_list_element" key={tag.id}> {tag.title} </li>
          )}
        </ul>
      </div>
      <Button onClick={showModalCreate}>+ new</Button>
      <Button className="small_button" onClick={applyFilters}> Show favorite </Button>
      <Modal
        title="Note"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            {note && <Button color="default" variant="text" onClick={addToFavorite}> Favorite </Button>}
            <CancelBtn />
            <OkBtn />
          </>
        )}
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
        {notes
        .filter(note => !isFiltered || note.favorite)
        .map((note) => (
          <div className="list_wrapper">
            <li onClick={() => showModalUpdate(note.id)} key={note.id}>
              {note.title}
            </li>
            <div className="list_element_2">
              <CloseOutlined onClick={ () => deleteNote(note.id)} />
            </div>
            <div className="list_element_3">
              {note.favorite && <HeartFilled color="red" />}
            </div>
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
