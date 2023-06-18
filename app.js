const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// MongoDB connection
const client = new MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());

// GET /api/v3/app/events
app.get('/api/v3/app/events', async (req, res) => {
  try {
    const eventId = req.query.id;
    const eventType = req.query.type;
    const eventLimit = parseInt(req.query.limit);
    const eventPage = parseInt(req.query.page);

    // Connect to MongoDB
    await client.connect();
    const db = client.db('Sample');
    const collection = db.collection('products');

    if (eventId) {
      // Find event by ID
      const event = await collection.findOne({ _id: ObjectId(eventId) });

      if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
      }

      // Return the event
      return res.json(event);
    } else if (eventType === 'latest') {
      // Find latest events with pagination
      const events = await collection
        .find({})
        .sort({ _id: -1 })
        .skip((eventPage - 1) * eventLimit)
        .limit(eventLimit)
        .toArray();

      // Return the events
      return res.json(events);
    } else {
      return res.status(400).json({ error: 'Invalid request parameters.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

// POST /api/v3/app/events
app.post('/api/v3/app/events', async (req, res) => {
  try {
    const { name, files, tagline, schedule, description, moderator, category, sub_category, rigor, rank } = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db('Sample');
    const collection = db.collection('products');

    // Insert the new event into the database
    const result = await collection.insertOne({
      name,
      'files[image]': files.image,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor,
      rank,
    });

    if (result.insertedCount !== 1) {
      return res.status(500).json({ error: 'Failed to create the event.' });
    }

    // Return a success response
    return res.json({ success: true, message: 'Event created successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

// PUT /api/v3/app/events/:id
app.put('/api/v3/app/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, files, tagline, schedule, description, moderator, category, sub_category, rigor, rank } = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db('Sample');
    const collection = db.collection('products');

    // Update the event in the database
    const result = await collection.updateOne(
      { _id: ObjectId(eventId) },
      {
        $set: {
          name,
          'files[image]': files.image,
          tagline,
          schedule,
          description,
          moderator,
          category,
          sub_category,
          rigor,
          rank,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Return a success response
    return res.json({ success: true, message: 'Event updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

// DELETE /api/v3/app/events/:id
app.delete('/api/v3/app/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Connect to MongoDB
    await client.connect();
    const db = client.db('Sample');
    const collection = db.collection('products');

    // Delete the event from the database
    const result = await collection.deleteOne({ _id: ObjectId(eventId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Return a success response
    return res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

// Start the server
app.listen(4500, () => {
  console.log(`Server is running on http://localhost:4500`);
});