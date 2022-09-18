// modulos externos
const inquirer = require("inquirer")
const chalk = require("chalk")
// modulos internos
const fs = require('fs')
console.log('Iniciamos o Accounts')

operation()
    function operation() {
        inquirer
        .prompt([ //criando a lista de opções ao usuário
            {
                type: 'list',
                name: 'action',
                message: 'O que você deseja fazer?',
                choices: [
                    'Criar conta',
                    'Consultar Saldo',
                    'Depositar',
                    'Sacar',
                    'Transferir dinheiro para outra conta',
                    'Sair'
                ],
            }
        ]).then(
            (answer) => {
                const action = answer['action']
                
                if (action === 'Criar conta') {
                    createAccount()
                } 
                else if (action ==='Depositar') {
                    deposit()

                }

                else if  (action === 'Consultar Saldo') {
                    getAccountBalance()

                }
                else if (action === 'Sacar'){
                    withdraw()

                }
                else if (action === 'Sair' ) {
                    console.log(chalk.bgBlue.black ('Obrigado por usar o Accounts!'))
                    process.exit()
                }
                else if (action === 'Transferir dinheiro para outra conta') {
                    transfer()
                }

            }
        )
        .catch(
            (err) => console.log(err)
            )
    }

    // TRANSFER
    function transfer() {

        inquirer.prompt([
            {
                name: 'accountName',
                message: 'Digite o nome da conta em que o dinheiro a ser transferido está: '
            }
        ]).then( (answer) => {
            const accountName = answer['accountName']

            //verify if account exists
            if(!checkAccount(accountName)){
                return transfer()
            }
            const original = accountName

            inquirer.prompt([ // conta destino
                {
                    name: 'accountName',
                    message: 'Digite o nome da conta para a qual o dinheiro será transferido: '
                }
            ]).then( (answer) => {
                const accountName = answer['accountName']

                //verify if destiny account exists
                if(!checkAccount(accountName)){
                return transfer()
                }

                if(accountName === original){
                    console.log(chalk.bgRed.black('Você não pode transferir dinheiro para a mesma conta de origem!'))
                    return transfer()
                }


               
                transferCode(original, accountName)
            }).catch(err => console.log(err))
        }
        ).catch(err => console.log(err))
    }

    //transfer code
    function transferCode(originalAccount, finalAccount){
        const original = originalAccount
        const final = finalAccount
        originalAccount = getAccount(originalAccount)
        finalAccount = getAccount(finalAccount)
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Digite o valor a ser transferido: '
            }
            
        ])
        .then(answer => {
            const amount = answer[`amount`]
            const originalTotalValue = parseFloat(originalAccount.balance)
            const transferValue = parseFloat(amount)

            /*console.log(`O total da conta em que o dinheiro a ser transferido está é $${originalTotalValue}`)
            console.log(`O valor a ser transferido é $${transferValue}`)*/

            if(transferValue > originalTotalValue){
                console.log(chalk.bgRed.black('Valor indisponível'))
                return transfer()
            }
            else{

                //Atualizando o valor da conta original
                originalAccount.balance = originalAccount.balance - transferValue

                fs.writeFileSync(
                    `accounts/${original}.json`,
                    JSON.stringify(originalAccount), //transformando JSON em texto
                    function (err) {
                        console.log(err)
                    },
                )
                
                //Atualizando o valor da conta destino
                finalAccount.balance = parseFloat(finalAccount.balance) + transferValue

                fs.writeFileSync (
                    `accounts/${final}.json`,
                    JSON.stringify(finalAccount), //transformando JSON em texto
                    function (err) {
                        console.log(err)
                    },
                )
                console.log(chalk.bgGreen.white('Saldo transferido com sucesso!'))

            }
        })
    }
    

    // CREATE AN ACCOUNT
    function createAccount () {

        console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
        console.log(chalk.green('Define as opções da sua conta a seguir'))
        buildAccount()
    }

    function buildAccount () {

        inquirer.prompt ([
            {
                name: 'accountName',
                message: 'Digite um nome para a sua conta: '
            }
        ]).then(
            answer => {
                const accountName = answer['accountName']
                console.info(accountName)

                if(!fs.existsSync('accounts')) {
                    fs.mkdirSync('accounts')
                } //verificando se o diretório não existe e se não existir ele o cria
 
                if (fs.existsSync(`accounts/${accountName}.json`)){
                    console.log(
                        chalk.bgRed.black('Esta conta já existe, escolha outro nome!')
                    )
                    buildAccount()
                    return
                } //verificando se o nome de usuário já existe
            
                fs.writeFileSync(`accounts/${accountName}.json`, `{"balance": 0}`,
                function(err) {
                    console.log(err)
                },
                )
                console.log(chalk.green(`Parabéns, a sua conta foi criada!`))
                operation()
            })
        .catch (err => console.log(err))
    }

    //ADD AN AMOUNT TO USER ACCOUNT
    function deposit () {

        inquirer.prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            }
        ])
        .then((answer) => {
            const accountName = answer['accountName']

            //verify if account exists
            if(!checkAccount(accountName)){
                return deposit()
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Qual é o valor que desejas depositar?',
                }
            ])
                .then((answer) => {
                    const amount= answer['amount']

                    // add an amount
                    addAmount(accountName, amount)
                    operation()
                } )
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }

    function checkAccount(accountName){

        if(!fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
            return false
        }
        return true
    }

    function addAmount(accountName, amount){
        const accountData = getAccount(accountName)
        if(!amount) {
            console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
            return deposit()
        }
        accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
        fs.writeFileSync(
            `accounts/${accountName}.json`,
            JSON.stringify(accountData), //transformando JSON em texto
            function (err) {
                console.log(err)
            },
        )
        console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
    }//adiciona a quantia desejada à conta
    
    function getAccount(accountName){
        const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
            encoding: 'utf-8',
            flag: 'r'
        })

        return JSON.parse(accountJSON)
    }//retorna o arquivo.json


    // SHOW ACCOUNT BALANCE
    function getAccountBalance() {
        inquirer.prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?' 
            }
        ]).then((answer) => {
            const accountName = answer["accountName"]
            //verify if account exists
            if (!checkAccount(accountName)){
                return getAccountBalance()
            }
            const accountData = getAccount(accountName)
            console.log(chalk.bgBlue.black(
                `Olá, o saldo da sua conta é de R$${accountData.balance}`
            ))
            operation()
        })
    }


    // WITHDRAW AN AMOUNT FROM USER ACCOUNT
    function withdraw() {
        inquirer.prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            }
        ]).then( (answer) => {
            const accountName = answer['accountName'] 

            if(!checkAccount(accountName)){
                return withdraw()
            }
            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto desejas sacar?',
                },
            ]).then( answer => {
                const amount = answer[`amount`]
                removeAmount(accountName, amount)
            }
            ).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }
    function removeAmount (accountName, amount) {
        const accountData = getAccount(accountName)

        if(!amount) {
            console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
            return withdraw()
        }

        if(accountData.balance < amount) {
            console.log(chalk.bgRed.black('Valor indisponível'))
            return withdraw()
        }

        accountData.balance = parseFloat (accountData.balance) - parseFloat(amount)
        fs.writeFileSync (
            `accounts/${accountName}.json`,
            JSON.stringify(accountData),
            function (err) {console.log(err)},)

        console.log(chalk.green (`Foi realizado um saque de R$${amount} na sua conta`))
        operation()
    }


