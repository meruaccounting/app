## API DOCUMENTATION

### TEAM API

_Creating Team_

> name - createTeam
> route - POST /team/create
> data sent - object {name : "team name"}

_Get Team List / Employee List_

> name - getTeam
> route - GET /team/getTeam
> data sent

_Update Member / Add Employee to Team_

> name - updateMember
> route - PATCH /team/updateTeam
> data sent - object {employeId : "employee id" , teamId , "team id"}

_Remove/ Delete Member_

> name - removeMember
> route - DELETE team/removeMember
> data sent - object {employeId : "employee id" , teamId , "team id"}

### EMPLOYEE API

_Get Employee Details_

> name - getEmployeeDetails
> route - GET /employee/${id}
> data sent - string "id"

### CLIENT API

_Get Client Details_

> name - getClient
> route - GET /client/getClient
> data sent

_Add new Client_

> name - addClient
> route - POST /client
> data sent - object {name : "client name"}

_Delete an existing Client_

> name - deleteClient
> route - DELETE /client
> data sent

### PROJECTS API

_Get Project Details_

> name - getClientProjects
> route - GET /client/getClientProjects
> data sent

_Create a Project_

> name - createProject
> route - POST /project
> data sent - object {name : "project name" , clientId:"client id"}

_Add an existing Team to Project_

> name - addTeamToProject
> route - PATCH /project
> data sent - object {projectId : "project id" , teamId:"team id"}

_Edit an existing project_

> name - editProject
> route - PATCH /project/${id}
> data sent - string "id" , object {name:"new project name"}

_Delete an existing project_

> name - deleteProject
> route - DELETE /project
> data sent - object {projectId:"project id"}
