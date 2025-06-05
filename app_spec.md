# Task
To build a chrome addon with a modern aesthetic look and feel like the image in docs/images/UI.png

# addon fucntionalty
The plan for the addon is to be a toolkit for a solution consultant when demoing docusign products that might have multiple personas. As an example there is an image of the Flow of a demo in docs/images/iam-flow.png. The idea would be for a user to open the chrome addon, select the IAM dropdown and select their components, and this will behindthe scenes geenrate a list of steps that a user would takkie in a demo flow. The idea is inject an HTML banner with a persona image and a list of steps.

Things to consider that we are still working through:

- Seeing as we have options in checkboxes for features like web form/Maestro I think we should havea  standard flow (docs/images/iam-flow.png) and these checkboxes pop() / append steps from this to create an editable demo format.

# UI interaction
for "1. Select Demo Type:" When selecting a demo Type Options in the dropdown are "IAM (Intelligent Agreement Management) & "CLM (Contract Lifecycle Management). The selection  of this would change the IAM components section below it. If IAM is selected, then the options in the image are displayed. IF CLM selected then Have them be: 
- Doc Gen
- External Review
- Legal Review
- Approval
- Signature

for "2. Enter Persona Name:" 

- Text field like in the image

For "4. Select Demo Stage:" the options are 

- --Select Stage--
- Create 
- Commit
- Manage
