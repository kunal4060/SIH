#!/usr/bin/env python
# coding: utf-8

# # Importing the required modules

# In[34]:


# Modules used for data handling and visualisation
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import seaborn as sns
import random as r
sns.set_style("whitegrid")

# Modules used for suppressing warnings
import warnings 
warnings.filterwarnings('ignore')

# Modules used for dataset split
# import splitfolders
import os

# Modules used for model training and transfer learning
import tensorflow as tf
from tensorflow.keras.layers import Dense,Flatten
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
# pyrefly: ignore [missing-import]
from tensorflow.keras.applications.resnet50 import ResNet50
from tensorflow.keras import Model


# In[ ]:





# In[ ]:





# 

# In[35]:


# Centering all the output images in the notebook.
from IPython.core.display import HTML as Center

Center(""" <style>
.output_png {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
}
</style> """)


# # Dataset Exploration

# In[36]:


class Dataset:

    def __init__(self, dataset_path: str):
        self.PARENT = dataset_path
        self.class_distribution = dict()

    def __compute_class_distributions(self):
        for dirname in os.listdir(self.PARENT):
            full_path = os.path.join(self.PARENT, dirname)
            if not os.path.isdir(full_path):
                continue  # skip .DS_Store and other non-directory entries
            self.class_distribution[dirname] = len([
                f for f in os.listdir(full_path) if not f.startswith('.')
            ])

    def class_distributions(self):
        self.__compute_class_distributions()

        plt.figure(figsize=(10,10))
        plt.bar(self.class_distribution.keys(),
                self.class_distribution.values(),
                color=["crimson","red","orange","yellow"])
        plt.xticks(rotation=90)
        plt.title("Class Distribution of PlantVillage dataset")
        plt.xlabel("Class Label")
        plt.ylabel("Frequency of class")
        plt.show()

    def show_class_samples(self):
        # Only include actual directories (skips .DS_Store, etc.)
        class_dirs = sorted([
            d for d in os.listdir(self.PARENT)
            if os.path.isdir(os.path.join(self.PARENT, d))
        ])
        columns = 3
        rows = -(-len(class_dirs) // columns)  # ceiling division
        fig, axs = plt.subplots(rows, columns, figsize=(15, rows * 4))
        axs = axs.flatten()  # flatten to 1-D for easy indexing
        for c, dirname in enumerate(class_dirs):
            class_path = os.path.join(self.PARENT, dirname)
            imgs = [f for f in os.listdir(class_path) if not f.startswith('.')]
            if not imgs:
                continue
            img_path = r.choice(imgs)
            image = mpimg.imread(os.path.join(class_path, img_path))
            axs[c].imshow(image)
            axs[c].set_title(dirname, fontsize=7)
            axs[c].axis('off')
        # Hide any unused subplot slots
        for idx in range(len(class_dirs), len(axs)):
            axs[idx].set_visible(False)
        fig.suptitle("Image Samples of Plant Village dataset")
        plt.subplots_adjust(bottom=0.1, top=0.9, hspace=0.5)
        plt.show()


# ## Loading the dataset

# In[37]:


plant_village = Dataset("train_val_test/train")


# ## Class Distribution

# In[38]:


plant_village.class_distributions()


# ## Sample Images

# In[39]:


plant_village.show_class_samples()


# # Train, Test, Validation Split

# In[40]:


class DataSplit:

    def __init__(self, dataset_path: str, train_path: str, test_path: str, val_path: str) -> None:
        self.PARENT = dataset_path
        self.TRAIN_DIR = train_path
        self.TEST_DIR = test_path
        self.VAL_DIR = val_path
        self.train_gen = None
        self.test_gen = None
        self.val_gen = None

    def create_generators(self):
        self.train_gen = tf.keras.preprocessing.image.ImageDataGenerator(
            preprocessing_function=tf.keras.applications.resnet50.preprocess_input,
        )

        self.test_gen = tf.keras.preprocessing.image.ImageDataGenerator(
            preprocessing_function=tf.keras.applications.resnet50.preprocess_input
        )

        self.val_gen =  tf.keras.preprocessing.image.ImageDataGenerator(
            preprocessing_function=tf.keras.applications.resnet50.preprocess_input
        )

    def get_images(self):
        train_images = self.train_gen.flow_from_directory(
            directory=self.TRAIN_DIR,
            target_size=(75, 75),
            color_mode='rgb',
            class_mode='categorical',
            batch_size=32,
            shuffle=True,
            seed=42,
            subset='training'
        )

        val_images = self.val_gen.flow_from_directory(
            directory=self.VAL_DIR,
            target_size=(75, 75),
            color_mode='rgb',
            class_mode='categorical',
            batch_size=32,
            shuffle=True,
            seed=42
        )

        test_images = self.test_gen.flow_from_directory(
            directory=self.TEST_DIR,
            target_size=(75, 75),
            color_mode='rgb',
            class_mode='categorical',
            batch_size=32,
            shuffle=False,
            seed=42
        )

        return train_images, val_images, test_images


# In[41]:


ds = DataSplit("train_val_test", "train_val_test/train", "train_val_test/test", "train_val_test/val")


# In[42]:


# ds.create_generators()

# train_images, val_images, test_images = ds.get_images()


# ## Train Data Insights

# In[43]:


train = Dataset("train_val_test/train")


# In[44]:


train.class_distributions()


# In[45]:


train.show_class_samples()


# ## Test Data Insights

# In[46]:


test = Dataset("train_val_test/test")


# In[47]:


test.class_distributions()


# In[48]:


test.show_class_samples()


# ## Validation Data Insights

# In[49]:


val = Dataset("train_val_test/val")


# In[50]:


val.class_distributions()


# In[51]:


val.show_class_samples()


# ## Creating the data generators

# In[52]:


ds.create_generators()


# In[53]:


train, val, test = ds.get_images()


# # Transfer Learning

# In[54]:


class TransferLearning:

    def __init__(self, train, val) -> None:
        self.train = train
        self.val = val
        self.model = None
        self.history = None

    def load_model(self):
        self.model = ResNet50(weights = 'imagenet', 
                              include_top = False, 
                              input_shape = (75,75,3))

    def mark_layers_non_trainable(self):
        for layer in self.model.layers:
            layer.trainable = False

    def add_final_layer(self):
        self.x = Flatten()(self.model.output)
        self.x = Dense(1000, activation='relu')(self.x)
        self.predictions = Dense(38, activation = 'softmax')(self.x)

    def compile_model(self):
        self.model = Model(inputs = self.model.input, outputs = self.predictions)
        self.model.compile(optimizer='adam', loss="categorical_crossentropy", metrics=['accuracy'])

    def train_model(self):
        early_stop = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=3,
            restore_best_weights=True
        )
        self.history = self.model.fit(self.train,
                                      batch_size=32, 
                                      epochs=50, 
                                      validation_data=self.val,
                                      callbacks=[early_stop])

    def plot_history(self):
        fig, axs = plt.subplots(2, 1, figsize=(15,15))
        axs[0].plot(self.history.history['loss'])
        axs[0].plot(self.history.history['val_loss'])
        axs[0].title.set_text('Training Loss vs Validation Loss')
        axs[0].set_xlabel('Epochs')
        axs[0].set_ylabel('Loss')
        axs[0].legend(['Train','Val'])

        axs[1].plot(self.history.history['accuracy'])
        axs[1].plot(self.history.history['val_accuracy'])
        axs[1].title.set_text('Training Accuracy vs Validation Accuracy')
        axs[1].set_xlabel('Epochs')
        axs[1].set_ylabel('Accuracy')
        axs[1].legend(['Train', 'Val'])


# ## Transfer Learning using Resnet50

# In[55]:


tl = TransferLearning(train=train, val=val)


# ## Loading the Resnet50 from Keras Application

# In[56]:


tl.load_model()


# ## Making all the layers of the model non-trainable

# In[57]:


tl.mark_layers_non_trainable()


# ## Adding a final layer for classification of 38 classes

# In[58]:


tl.add_final_layer()


# ## Compiling model

# In[59]:


tl.compile_model()


# ## Training model

# In[60]:


tl.train_model()


# In[61]:


tl.model.save("models/first_model.h5")


# In[62]:


CLASS_NAMES = list(train.class_indices.keys())
CLASS_NAMES


# In[63]:


from sklearn.metrics import accuracy_score, classification_report, recall_score, precision_score, f1_score


# In[64]:


predictions = np.argmax(tl.model.predict(test), axis=1)


# In[65]:


acc = accuracy_score(test.labels, predictions)
cm = tf.math.confusion_matrix(test.labels, predictions)
clr = classification_report(test.labels, predictions, target_names=CLASS_NAMES)

print("Test Accuracy: {:.3f}%".format(acc * 100))

plt.figure(figsize=(12, 12))
sns.heatmap(cm, annot=True, fmt='g', vmin=0, cmap='Blues', cbar=False)
plt.xticks(ticks= np.arange(len(CLASS_NAMES)) + 0.5, labels=CLASS_NAMES, rotation=90)
plt.yticks(ticks= np.arange(len(CLASS_NAMES)) + 0.5, labels=CLASS_NAMES, rotation=0)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()


# In[66]:


print(clr)


# ## Plotting the Learning Curves

# In[67]:


tl.plot_history()


# - We can observe that model achieves an accuracy of 99.73% and 93.58% on training and validation sets respectively.
# - Moreover, we can also gauge that the model is overfitting slightly which can be handled by fine tuning the model using regularization and re-training the layers

# # Fine-tuning

# Fine Tuning is the approach in which a pretrained model is used. However, few of the layers are made trainable to understand the patterns in the current dataset. Morevoer, regularization can also be added in the form of dropout layers.

# In[68]:


class FineTuning:

    def __init__(self, train, val) -> None:
        self.train = train
        self.val = val
        self.model = None
        self.history = None
        self.fine_tune_from = 100

    def load_model(self):
        self.model = ResNet50(weights = 'imagenet', 
                              include_top = False, 
                              input_shape = (75,75,3))

    def fine_tune(self):
        for layer in self.model.layers[:self.fine_tune_from]:
            layer.trainable = False

        for layer in self.model.layers[self.fine_tune_from:]:
            layer.trainable = True

    def add_final_layer(self):
        self.x = Flatten()(self.model.output)
        self.x = Dense(1000, activation='relu')(self.x)
        self.predictions = Dense(38, activation = 'softmax')(self.x)

    def compile_model(self):
        self.model = Model(inputs = self.model.input, outputs = self.predictions)
        self.model.compile(optimizer='adam', loss="categorical_crossentropy", metrics=['accuracy'])

    def train_model(self):
        self.history = self.model.fit(self.train,
                                      batch_size=32, 
                                      epochs=10, 
                                      validation_data=self.val,
                                      callbacks=[
                                        tf.keras.callbacks.EarlyStopping(
                                            monitor='val_loss',
                                            patience=3,
                                            restore_best_weights=True
                                        )
                                     ])

    def plot_history(self):
        fig, axs = plt.subplots(2, 1, figsize=(15,15))
        axs[0].plot(self.history.history['loss'])
        axs[0].plot(self.history.history['val_loss'])
        axs[0].title.set_text('Training Loss vs Validation Loss')
        axs[0].set_xlabel('Epochs')
        axs[0].set_ylabel('Loss')
        axs[0].legend(['Train','Val'])

        axs[1].plot(self.history.history['accuracy'])
        axs[1].plot(self.history.history['val_accuracy'])
        axs[1].title.set_text('Training Accuracy vs Validation Accuracy')
        axs[1].set_xlabel('Epochs')
        axs[1].set_ylabel('Accuracy')
        axs[1].legend(['Train', 'Val'])


# ## Fine Tuning the ResNet50 model

# In[77]:


ft = FineTuning(train,val)


# ## Loading the ResNet50 model from keras applications

# In[78]:


ft.load_model()


# ## Making last 75 layers of the ResNet50 model trainable

# In[79]:


ft.fine_tune()


# ## Adding a final layer for classification of 38 classes

# In[80]:


ft.add_final_layer()


# ## Compiling the model

# In[81]:


ft.compile_model()


# ## Training the model for 5 epochs

# In[75]:


ft.train_model()


# In[ ]:


ft.model.save("models/second_model.h5")


# In[ ]:


predictions = np.argmax(ft.model.predict(test), axis=1)


# In[ ]:


acc = accuracy_score(test.labels, predictions)
cm = tf.math.confusion_matrix(test.labels, predictions)
clr = classification_report(test.labels, predictions, target_names=CLASS_NAMES)

print("Test Accuracy: {:.3f}%".format(acc * 100))

plt.figure(figsize=(12, 12))
sns.heatmap(cm, annot=True, fmt='g', vmin=0, cmap='Blues', cbar=False)
plt.xticks(ticks= np.arange(len(CLASS_NAMES)) + 0.5, labels=CLASS_NAMES, rotation=90)
plt.yticks(ticks= np.arange(len(CLASS_NAMES)) + 0.5, labels=CLASS_NAMES, rotation=0)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()


# In[ ]:


print(clr)


# ## Evaluation of the fine-tuned model

# In[ ]:


ft.model.evaluate(test)


# ## Plotting the learning curves of the fine-tuning process

# In[ ]:


ft.plot_history()


# # Conclusion

# - Transfer Learning is approach of using a model pretrained(i.e. ResNet50) on a large dataset(here, imagenet) and using its knowledge for our case.
# - As inferred earlier, transfer learning gives an accuracy of 99.73% and 93.58% on training and validation sets respectively which shows that the model is slightly overfitted resulting in the requirement of fine tuning of the model.
# - The model is fine tuned by letting the last 75 layers learn the patterns in the dataset and overcome the overfitting and improve the accuracy.
# - The fine tuned model gives an accuracy of 98.75%, 95.42%, and 95.56% on train, validation, and test splits.
# - On a final note, in the deep learning there is required of the large overhead of time and hardware requirements for Fine Tuning of the model.

# In[ ]:


# Calculate predictions for Fine-Tuning Model
predictions_ft = np.argmax(ft.model.predict(test), axis=1)

# Calculate metrics for Fine-Tuning Model
acc_ft = accuracy_score(test.labels, predictions_ft)
recall_ft = recall_score(test.labels, predictions_ft, average='weighted')
precision_ft = precision_score(test.labels, predictions_ft, average='weighted')
f1_ft = f1_score(test.labels, predictions_ft, average='weighted')



# In[ ]:


print("Accuracy: {:.9f}".format(acc_ft))
print("Precision: {:.9f}".format(precision_ft))
print("Recall: {:.9f}".format(recall_ft))
print("F1-score: {:.9f}".format(f1_ft))

