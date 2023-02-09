import Quiz from '../model/quiz.js';

//find single quiz detials
export function findQuiz(quiz_data, projection) {
    return new Promise (async (resolve, reject) => {
        try {
            let quiz = await Quiz.findOne(quiz_data, projection)
            resolve(quiz)
        } catch (error) {
            reject(error.message)
        }
    })
}

//find/show list of all active quizes 
export function findList(quiz_data, projection) {
    return new Promise(async (resolve, reject) => {
        try {
            let quiz_list = await Quiz.find(quiz_data, projection)
            resolve(quiz_list)
        } catch (error) {
            reject(error.message)
        }
    })
}

//ceate new quiz and save in the databsae
export function create(create_data) {
    return new Promise(async (resolve, reject) => {
        try {
            let create_quiz = await Quiz(create_data)
            create_quiz.save()
            resolve(create_quiz)
        } catch (error) {
            reject(error.message)
        }
    })
}

//delete a specific quiz 
export function deleteSingleQuiz(update_data, projection){
    return new Promise(async (resolve, reject ) => {
        try {
            let update_quiz = await Quiz.updateOne(update_data, projection)
            resolve(update_quiz)
        } catch (error) {
            reject(error.message)
        }
    })
}