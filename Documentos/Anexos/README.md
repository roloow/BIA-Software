Esta es una previsualización utilizando [notedown](https://github.com/aaren/notedown), para poder ver el correcto renderizado de este documento, solo abra el archivo de Análisis.

Análisis de Redes FF e implementación básica
-----
Prototipo funcional de una red que predice un DataSet de semillas en base a una
función sigmoidal.

```{.python .input  n=32}
import numpy as np
import random as rd
import pandas as pd
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
```

**A) Programa de entrenamiento**

Esta sección ha sido subdividida en cuatro etapas, las cuales involucran desde
la inicialización de la red hasta la implementación de la rutina principal de
entrenamiento. Para este trabajo deberemos primero crear la nueva red, donde
cada neurona tiene un conjunto de pesos, durante el entrenamiento tendremos que
almacenar propiedades adicionales es por este motivo que definiremos a una
**neurona** como un *diccionario* y guardaremos los pesos con el nombre
*weights*. Por otra parte, una red se organiza en *capas*, donde la capa de
entrada (*input layer*) es una fila del *dataset de entrenamiento*. La verdadera
primera capa es la capa escondida (*hidden layer*), la cual es seguida por la
capa de salida (*output layer*) que contiene una neurona por cada valor de una
clase. Como podemos inferir, organizaremos una capa como un arreglo (*lista*) de
neuronas (*diccionarios*) y una red como un arreglo (*lista*) de capas.

```python
neuron = dict()
neuron['weights'] = [value1, value2, value3, ..., valueN]

layer = list()
...
layer = [neuron1, neuron2, neuron3, ..., neuronM]

network = list()
...
network = [layer1, layer2, layer3, ..., layerZ]
```

Para dar valores iniciales a la red de pesos utilizaremos números pequeños
aleatoreos (**Libreria random**), los cuales estarán en el rango de 0 a 1.

```{.python .input  n=7}
#--------------------------------------------
#            initialize_network
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   n_inputs:  integer number of inputs
#   n_hidden:  integer number of neurons to 
#              have in the hidden layer
#   n_outputs: integer number of outputs
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    list of list of dictionaries that
#           means an array of layers of neurons
#   FUNCTION_CODING
def initialize_network(n_inputs, n_hidden, n_outputs):
    network = list()
    hidden_layer = list()
    for i in range(n_hidden):
        hidden_layer.append({'weights': [rd.random() for j in range(n_inputs + 1)]})
    network.append(hidden_layer)
    
    output_layer = list()
    for i in range(n_outputs):
        output_layer.append({'weights': [rd.random() for j in range(n_hidden + 1)]})
    network.append(output_layer)
    
    return network
#   FUNCTION_EXPLANATION
#   Creates a new neural network ready for 
#   training. It accepts three parameters,
#   the number of inputs, the number of neurons
#   to have in the hidden layer and the number 
#   of outputs.
#--------------------------------------------
```

Podemos notar que la capa escondida contiene *n<sub>hidden</sub>* neuronas y
cada neurona tiene *n<sub>inputs</sub> + 1* pesos, una por cada columna en el
*dataset* y uno adicional para el **bias** (*sesgo*). También se puede notar que
la capa de salida que se conecta a la capa escondida presenta
*n<sub>outputs</sub>* neuronas y cada una con *n<sub>hidden</sub> + 1* pesos.
Esto permite que cada neurona en la capa de salida esté conectada (*tenga un
peso*) con una neurona en la capa escondida.

#### Testing de la función


```{.python .input  n=8}
# Mantener la aleatoriedad controlada
rd.seed(1)

# Testing
network = initialize_network(2, 1, 2)
for layer in network:
    print layer
```

```{.json .output n=8}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[{'weights': [0.13436424411240122, 0.8474337369372327, 0.763774618976614]}]\n[{'weights': [0.2550690257394217, 0.49543508709194095]}, {'weights': [0.4494910647887381, 0.651592972722763]}]\n"
 }
]
```

Se puede notar que la capa escondida tiene una neurona con 2 pesos además del
sesgo y la capa de salida tiene 2 neuronas, cada una con 1 peso además del
sesgo. Ahora que ya sabemos como crear e inicializar una red, veamos como
calcular la salida.

----------------
#### Forward Propagate

Se puede calcular la salida de una red neuronal mediante la propagación de una
señal de entrada a través de las capas hasta que la capa de salida retorne el
valor.

Para este proceso tenemos tres partes:
1. Activación de la neurona
2. Transferencia de la neurona
3. Propagación hacia adelante

----------------

El primer paso es calcular la activación de una neurona dadas una entrada. Para
este caso, podremos decir que la entrada es una fila del *DataSet* de
entrenamiento al igual que en el caso de la capa escondida. La función para
calcular es muy cercana a una regresión lineal, donde se calcula la suma de los
pesos para cada entrada. El sesgo puede considerarse como aparte, o como que es
multiplicado siempre por 1.

\begin{equation*}
activation = ( \sum_{k=1}^n weight_i * input_i ) + bias
\end{equation*}

Gracias a nuestra definición previa podremos siempre definir al *bias* como el
último valor del arreglo de pesos, entonces una implementación de esta función
es

```{.python .input  n=9}
#--------------------------------------------
#            activate_neuron
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   weights:  list of floats
#   inputs:   list of floats
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    integer value that represent the 
#           activation equation
#   FUNCTION_CODING
def activate_neuron(weights, inputs):
    activation = weights[-1]
    quantum = len(weights) - 1
    for i in range(quantum):
        activation += weights[i] * inputs[i]
        
    return activation
#   FUNCTION_EXPLANATION
#   Calculate the neuron activation for an input
#--------------------------------------------
```

----------------
Ahora que tenemos nuestra función de activación, veamos como utilizarla. Para
poder lograr obtener el resultado deberemos utilizar la función de activación y
transferir este valor a través de las capas.

Existen diferentes funciones de transferencia pero tradicionalmente se utiliza
la [función Sigmoid](https://en.wikipedia.org/wiki/Sigmoid_function). Otras
opciones pueden ser:

- [Tangente hiperbólica](https://en.wikipedia.org/wiki/Hyperbolic_function)
- [Rectificante](https://en.wikipedia.org/wiki/Rectifier_(neural_networks)

La activación de sigmoid, también conocida como función logística, pede tomar
cualquier valor y producir un número entre 0 y 1 dentro de su curva, la cual
tiene una forma parecida a una S aplastada.
<img src="https://upload.wikimedia.org/wikipedia/commons/8/88/Logistic-
curve.svg" width="400" height="800" />

Una particularidad de esta función es que se le puede calcular facilmente la
derivada, lo cual facilitará implementaciones posteriores. Entonces, definimos
la función sigmoid como

\begin{equation*}
S(t) = \frac{1}{1 + e^{-t}}
\end{equation*}

Lo cual implementaremos de la siguiente forma

```{.python .input  n=10}
#--------------------------------------------
#            transfer
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   value: float number
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    float number of transferation
#   FUNCTION_CODING
def transfer(value):
    transfer_value = 1.0 / (1 + np.exp(-value))
    
    return transfer_value
#   FUNCTION_EXPLANATION
#   Calculate the sigmoid function value of input
#--------------------------------------------
```

----------------
Ya habiendo definido nuestra base, la propagación es una aplicación directa.
Trabajando sobre cada capa de la red se calcula la salida de cada neurona, la
cual sera utilizada como input para la siguiente capa.

Debido a la estructura que elegimos para la neurona, podremos guardar el valor
de salida como una llave del diccionario, además dentro de la iteración de capas
deberemos almacenar todos estos valores para que al cambio de capa sean
utilizados como los nuevos valores de entrada.

```{.python .input  n=11}
#--------------------------------------------
#            forward_propagate
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   network: list of lists
#   row:     list of float values
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    list of float values
#   FUNCTION_CODING
def forward_propagate(network, row):
    inputs = row
    for layer in network:
        new_inputs = list()
        for neuron in layer:
            activation_value = activate_neuron(neuron['weights'], inputs)
            neuron['output'] = transfer(activation_value)
            new_inputs.append(neuron['output'])
        inputs = new_inputs
        
    return inputs
#   FUNCTION_EXPLANATION
#   Propagates the values from a row of values
#   till the output's layer and returns the last
#   list of values
#--------------------------------------------
```

-----------------
Finalmente debemos realizar un testing del funcionamiento. Utilizando los
valores previos de red y generando una lista a propagar de valores 1 y 0
obtendremos una salida de dos valores dado que la red que habiamos configurado
contenia dos neuronal en su capa final.

```{.python .input  n=12}
row = [1, 0, None]
output = forward_propagate(network, row)

print output
```

```{.json .output n=12}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[0.66299701298528868, 0.72531607252797481]\n"
 }
]
```

#### Backward propagate

Esta sección de trabajo es la que permite determinar errores comparando el valor
esperado con el valor propagado de la red. Este error es revisado a través de la
red desde la capa final hasta la capa escondida asignando responsabilidad sobre
el error y actualizando los pesos a medida que avanza.

La propagación del error tiene una base científica en el *Cálculo*, sin embargo
como simplificación nos mantendremos al margen de su funcionamiento y nos
concentraremos en su uso.

Al igual que la sección anterior, podemos dividir el trabajo en dos partes

1. Derivada de transferencia
2. Error de propagación hacia atras
-----------------

Lo primero es calcular la derivada de transferencia que para este informe
estamos utilizando la función **Sigmoid**, cuya derivada se expresa de la
siguiente forma

\begin{equation*}
S'(t) = S(t)(1 - S(t))
\end{equation*}

Esto nos permite implementarla de una manera muy sencilla

```{.python .input  n=13}
#--------------------------------------------
#            transfer_derivative
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   S:   float number representing S(t)
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    float number 
#   FUNCTION_CODING
def transfer_derivative(S):
    derivative = S * (1.0 - S)
    
    return derivative
#   FUNCTION_EXPLANATION
#   Calculate the transfer derivative 
#--------------------------------------------
```

---------------
Ahora que tenemos la función implementada, debemos calcular el error para cada
salida de la neurona, esto nos dará la señal de error que propagaremos hacia
atrás a través de la red.

Para obtener el error que mencionamos recién es necesario realizar una
comparación entre el valor esperado y el valor resultante, a lo cual además
multiplicaremos la derivada de la transferencia, esto se expresa matemáticamente
como

\begin{equation*}
error = (E(x) - O(x)) * \frac{\partial Sigmoid(x)}{\partial x}
\end{equation*}

Este cálculo de error es usado para neuronas en la capa de salida, donde el
valor esperado es el valor de la clase. La señal para una neurona en la capa
escondida es calculada como el error de los pesos de cada neurona en la capa de
salida.

Ahora bien, la señal del error propagado se acumula y usa para determinar el
error de la neurona en la capa escondida de la siguiente forma

\begin{equation*}
Error_{propagado} = (weight_i * error_j) * \partial {transfer}
\end{equation*}

Podemos observar como el error_j es la señal de la j-ésima neurona en la capa de
salida, el weight_k es el peso que conecta la k-ésima neurona con la neurona
actual mientras que la derivada de la transferencia se calcula con el valor de
salida de la neurona actual.

Como sabemos que nuestra red es un tipo de dato ordenado, por lo que para ir
desde la capa final hasta la inicial, basta con recorrerla de manera inversa, es
así como debemos calcular el error de la neurona y almacenarlo en la misma, a
este error le llamaremos delta para representar el cambio que este involucra. Se
podrá apreciar que la señal de error para las neuronas de la capa oculta es un
valor acumulativo que proviene desde la capa de salida.

```{.python .input  n=14}
#--------------------------------------------
#            backward_propagate
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   network:   list of lists
#   expected:  list of floats
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    boolean of aplication where True
#           means a correctfull run of the algorithm
#   FUNCTION_CODING
def backward_propagate(network, expected):
    try:
        size = len(network)
        iteration = range(size)[::-1]
        for i in iteration:
            layer = network[i]
            errors = list()
            if i != (size - 1):
                for j in range(len(layer)):
                    error = 0.0
                    for neuron in network[i + 1]:
                        error += neuron['weights'][j] * neuron['delta']
                    errors.append(error)
            else:
                for j in range(len(layer)):
                    neuron = layer[j]
                    errors.append(expected[j] - neuron['output'])
            for k in range(len(layer)):
                neuron = layer[k]
                neuron['delta'] = errors[k] * transfer_derivative(neuron['output'])
        return 0
    except:
        return 1
#   FUNCTION_EXPLANATION
#   Propagates de errors and blame the current neuron
#   by adapting its values
#--------------------------------------------
```

**Testing de propagación**

Para el ejemplo, se mostrará la red tras la completa propagación de errores. El
valor del error se calcula y almacena en las neuronas.


```{.python .input  n=15}
expected = [0, 1]
backward_propagate(network, expected)
for layer in network:
    print layer
```

```{.json .output n=15}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[{'output': 0.71056688831159409, 'weights': [0.13436424411240122, 0.8474337369372327, 0.763774618976614], 'delta': -0.002711797799238243}]\n[{'output': 0.66299701298528868, 'weights': [0.2550690257394217, 0.49543508709194095], 'delta': -0.14813473120687762}, {'output': 0.72531607252797481, 'weights': [0.4494910647887381, 0.651592972722763], 'delta': 0.054726011578796883}]\n"
 }
]
```

#### Entrenamiento de la red

La red será entrenada utilizando el metodo SGD *(Stochastic Gradient Descent)*.
Esto involucra exponer los datos de entrenamiento multiples veces a la red y que
por cada fila de datos propagar las entradas hacia adelante y propagar los
errores hacia atras para actualizar los pesos de la red.

Este proceso, al igual como hemos realizado en todo el trabajo, puede
descomponerse en dos partes

1. Actualizar Pesos
2. Entrenar la red

---------------------
Dado que ya hemos calculado los errores para cada neurona en nuestra red,
podemos utilizar dicho error para actualizar los pesos. Si definimos al peso
como **_W_**, un parametro de aprendizaje **_L<sub>r</sub>_**, el error como un
delta **$\delta$** y una entrada, causante del error como **_I_**.

\begin{equation*}
W_{new} = W_{prev} + L_r *  \delta * I
\end{equation*}

De la misma forma, se puede actualizar el sesgo con la excepción de que no tiene
un parametro de entrada o bien, puede ser evaluado como un parametro de entrada
*1.0*.

El paramentro de aprendizaje, referido como *Learning Rate*, controla cuanto
cambiar el peso para corregir el error en términos porcentuales. Siempre es
preferible utilizar valores de aprendizaje bajos por el impacto que este puede
tener.

Una implementación para la actualización de los pesos debe recorrer las neuronas
y aplicar la ecuación descrita, cabe resaltar que las entradas utilizadas por
capa son referentes a las salidas de la capa anterior.

```{.python .input  n=16}
#--------------------------------------------
#            update_weights
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   network:   list of lists
#   row:  list of floats
#   lr:  float number refered to learning rate
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    No outs
#   FUNCTION_CODING
def update_weights(network, row, lr):
    for i in range(len(network)):
        inputs = row[:-1]
        if i != 0:
            inputs = [neuron['output'] for neuron in network[i - 1]]
        for neuron in network[i]:
            for j in range(len(inputs)):
                neuron['weights'][j] += lr * neuron['delta'] * inputs[j]
            neuron['weights'][-1] += lr * neuron['delta']
#   FUNCTION_EXPLANATION
#   Update the values of weights by the Lr and delta given
#--------------------------------------------
```

--------------------
Una vez que ya tenemos nuestra función de actualización debemos generar el
procedimiento para el entrenamiento, el cual se basa en una red inicializada con
un *DataSet* entregado, un *learning_rate*, un número de *epoch* (época, o
generación) y un número esperado de valores de salida.

```{.python .input  n=17}
#--------------------------------------------
#            train_network
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   network:   list of lists
#   train:  dataset for training
#   lr:  float number refered to learning rate
#   n_epoch:  int number for generations of training
#   n_outputs: int number
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    list of errors for different epochs
#   FUNCTION_CODING
def train_network(network, train, lr, n_epoch, n_outputs):
    errors = list()
    for epoch in range(n_epoch):
        sum_error = 0
        for row in train:
            outputs = forward_propagate(network, row)
            expected = [0 for i in range(n_outputs)]
            expected[row[-1] - 1] = 1
            sum_error += sum([(expected[i] - outputs[i])**2 for i in range(len(expected))])
            backward_propagate(network, expected)
            update_weights(network, row, lr)
        errors.append(sum_error)
    return errors
#   FUNCTION_EXPLANATION
#   Uses all the functions describe above and calculates the
#   error for the epoch
#--------------------------------------------
```

Ahora que hemos implementado todas las funciones necesarias para entrenar la
red, podemos poner a prueba nuestra implementación. Para probarla utilizaremos
un *DataSet* estático.

**Testing del entrenamiento**

```{.python .input  n=18}
DataSet = [ [2.7810836,2.550537003,0],
            [1.465489372,2.362125076,0],
            [3.396561688,4.400293529,0],
            [1.38807019,1.850220317,0],
            [3.06407232,3.005305973,0],
            [7.627531214,2.759262235,1],
            [5.332441248,2.088626775,1],
            [6.922596716,1.77106367,1],
            [8.675418651,-0.242068655,1],
            [7.673756466,3.508563011,1] ]
```

Entonces para comprobarlo utilizaremos una red neuronal que contenga 2 neuronas
en la capa oculta, con una clasificación binaria lo que generará dos neuronas en
la capa de salida. El entrenamiento constará de 20 generaciones con un rango de
aprendizaje de 0.5.

```{.python .input  n=19}
rd.seed(1)
n_inputs = len(DataSet[0]) - 1
n_outputs = len(set([row[-1] for row in DataSet]))
network = initialize_network(n_inputs, 2, n_outputs)
errors = train_network(network, DataSet, 0.89, 20, n_outputs)

for i in range(len(errors)):
    print '[epoch]', i, '[error]', errors[i]
```

```{.json .output n=19}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[epoch] 0 [error] 6.08867421893\n[epoch] 1 [error] 5.46904159469\n[epoch] 2 [error] 5.43214715597\n[epoch] 3 [error] 5.16251506256\n[epoch] 4 [error] 4.83826372502\n[epoch] 5 [error] 4.41471470936\n[epoch] 6 [error] 3.90580011618\n[epoch] 7 [error] 3.37420648509\n[epoch] 8 [error] 2.86527832278\n[epoch] 9 [error] 2.42606936601\n[epoch] 10 [error] 2.05492250397\n[epoch] 11 [error] 1.7481461276\n[epoch] 12 [error] 1.50013103977\n[epoch] 13 [error] 1.29833280754\n[epoch] 14 [error] 1.13201792655\n[epoch] 15 [error] 0.995021737772\n[epoch] 16 [error] 0.882182593443\n[epoch] 17 [error] 0.788595416519\n[epoch] 18 [error] 0.710132437047\n[epoch] 19 [error] 0.643566369462\n"
 }
]
```

```{.python .input  n=20}
for layer in network:
    print layer
```

```{.json .output n=20}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[{'output': 0.98957260314354578, 'weights': [0.40381951702431451, 0.25825111025979969, 0.58413283450372311], 'delta': 0.00056336962673942108}, {'output': 0.021328388815570424, 'weights': [-1.7011177472362136, 2.2639300542024294, 1.0749076535648963], 'delta': -0.0032644537164291877}]\n[{'output': 0.82373380608030689, 'weights': [1.1878608754145139, -3.1535388684614309, 0.47873117507762042], 'delta': 0.025593220817844205}, {'output': 0.16367165233534778, 'weights': [-1.1254687797973606, 3.3771414429014723, -0.62892926931453141], 'delta': -0.022403906486351363}]\n"
 }
]
```

**B) Programa de predicción**

Un programa que logre realizar una predicción suena algo descabellado, sin
embargo, ya teniendo una red neuronal entrenada, podemos realizar una
implementación sencilla para generar una solución. Como tenemos la función
*forward_propagate*, podemos utilizar los valores de salida que nos genera como
una predicción.

En matemática existe una definición en particular que utilizaremos, el **arg
max**, siendo los puntos del dominio de una funcion donde los valores son
máximos. [Leer más detalles](https://en.wikipedia.org/wiki/Arg_max) Esto es para
retornar el valor de salida en la posición de mayor probabilidad.

```{.python .input  n=21}
#--------------------------------------------
#            predict
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   network:   list of lists
#   row:  list of floats
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    value of output for maximun arg
#   FUNCTION_CODING
def predict(network, row):
    outputs = forward_propagate(network, row)
    return outputs.index(max(outputs))
#   FUNCTION_EXPLANATION
#   Predict using the information of a row
#--------------------------------------------
```

Ahora que tenemos una función para realizar predicciones en base a
*forward_propagate* debemos vectorizarla y admitirle un conjunto de ejemplos
mayor. Como sabemos que la función aplica sobre una fila de valores, un
conjuntos de varios ejemplos estará definido como un dataset de varias filas

```{.python .input  n=22}
#--------------------------------------------
#            multi_predict
#--------------------------------------------
#   FUNCTION_IN_PARAMETERS_DEFINITION
#   network:   list of lists
#   examples:  list of lists
#
#   FUNCTION_OUT_PARAMETERS_DEFINITION
#   out:    list of values of output for maximun arg
#   FUNCTION_CODING
def multi_predict(network, examples):
    predictions = list()
    for row in examples:
        prediction = predict(network, row)
        predictions.append((row[-1], prediction))
    return predictions
#   FUNCTION_EXPLANATION
#   Uses the row prediction and iterates on an
#   example dataset
#--------------------------------------------
```

**Testing de las predicciones**

```{.python .input  n=40}
network = [[{'weights': [-1.482313569067226, 1.8308790073202204, 1.078381922048799]}, {'weights': [0.23244990332399884, 0.3621998343835864, 0.40289821191094327]}],
           [{'weights': [2.5001872433501404, 0.7887233511355132, -1.1026649757805829]}, {'weights': [-2.429350576245497, 0.8357651039198697, 1.0699217181280656]}]]

predictions = multi_predict(network, DataSet)
for tup in predictions:
    expected, got = tup
    print '[Expected]', expected, '[Got]', got

```

```{.json .output n=40}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[Expected] 0 [Got] 0\n[Expected] 0 [Got] 0\n[Expected] 0 [Got] 0\n[Expected] 0 [Got] 0\n[Expected] 0 [Got] 0\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n"
 }
]
```

**C) Comprobación de datos**

Para demostrar el funcionamiento del algoritmo utilizaremos utilizaremos un
dataset de clasificación de semillas el cual podemos encontrar en [la siguiente
url](http://archive.ics.uci.edu/ml/machine-learning-
databases/00236/seeds_dataset.txt). Los datos se normalizan según lo entregado
en el enunciado de la tarea.

```{.python .input  n=24}
url = 'http://archive.ics.uci.edu/ml/machine-learning-databases/00236/seeds_dataset.txt'
df = pd.read_csv(url, sep=r'\s+', header=None)
X_train = df.ix[:,0:6]
y_train = df.ix[:,7]
scaler = StandardScaler().fit(X_train)
X_train = scaler.transform(X_train)
```

Ahora que tenemos normalizados los datos, debemos convertirlos a un formato
legible por nuestra implementación, la cual debe tener los valores de las
etiquetas **y_train** como final de las filas del dataset.

```{.python .input  n=25}
DataSeeds = X_train.tolist()
for idx, row in enumerate(DataSeeds):
    row.append(y_train[idx])
```

Ahora tomamos los datos, inicializamos la red y generamos nuestra solución

```{.python .input  n=53}
n_inputs = len(DataSeeds[0]) - 1
n_outputs = len(set([row[-1] for row in DataSeeds]))
n_hidden = 5 # Alterable

rd.seed(1)
network = initialize_network(n_inputs, n_hidden, n_outputs)

n_epochs = 10
learning_rate = 0.2

errors = train_network(network, DataSeeds, learning_rate, n_epochs, n_outputs)
ciclos = [i for i in range(1,n_epochs+1)]
```

```{.python .input  n=51}
plt.plot(ciclos, errors)
plt.xlabel('Ciclo')
plt.ylabel('Error')

plt.show()
```

```{.json .output n=51}
[
 {
  "data": {
   "image/png": "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\n+bPZVNO9FnYAAAAASUVORK5CYII=\n",
   "text/plain": "<matplotlib.figure.Figure at 0xa5c56b0>"
  },
  "metadata": {},
  "output_type": "display_data"
 }
]
```

```{.python .input  n=55}
predictions = multi_predict(network, DataSeeds)

for tup in predictions:
    expected, got = tup
    print '[Expected]', expected, '[Got]', got
```

```{.json .output n=55}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 1\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 1\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 1\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n"
 }
]
```

```{.python .input  n=59}
rd.seed(1)
network = initialize_network(n_inputs, n_hidden, n_outputs)

n_epochs = 50
learning_rate = 0.5

errors = train_network(network, DataSeeds, learning_rate, n_epochs, n_outputs)
ciclos = [i for i in range(1,n_epochs+1)]

plt.plot(ciclos, errors)
plt.xlabel('Ciclo')
plt.ylabel('Error')
plt.show()
```

```{.json .output n=59}
[
 {
  "data": {
   "image/png": "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\ncwoCEZGY+/8g6eFdsSe1AgAAAABJRU5ErkJggg==\n",
   "text/plain": "<matplotlib.figure.Figure at 0xa0a3ed0>"
  },
  "metadata": {},
  "output_type": "display_data"
 }
]
```

```{.python .input  n=60}
predictions = multi_predict(network, DataSeeds)

for tup in predictions:
    expected, got = tup
    print '[Expected]', expected, '[Got]', got
```

```{.json .output n=60}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 2\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 3\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n"
 }
]
```

```{.python .input  n=63}
rd.seed(1)
network = initialize_network(n_inputs, n_hidden, n_outputs)

n_epochs = 400
learning_rate = 0.2

errors = train_network(network, DataSeeds, learning_rate, n_epochs, n_outputs)
ciclos = [i for i in range(1,n_epochs+1)]

plt.plot(ciclos, errors)
plt.xlabel('Ciclo')
plt.ylabel('Error')
plt.show()
```

```{.json .output n=63}
[
 {
  "data": {
   "image/png": "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\ngg==\n",
   "text/plain": "<matplotlib.figure.Figure at 0xa9bb090>"
  },
  "metadata": {},
  "output_type": "display_data"
 }
]
```

```{.python .input  n=65}
predictions = multi_predict(network, DataSeeds)

for tup in predictions:
    expected, got = tup
    print '[Expected]', expected, '[Got]', got
```

```{.json .output n=65}
[
 {
  "name": "stdout",
  "output_type": "stream",
  "text": "[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 1 [Got] 1\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 2 [Got] 2\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n[Expected] 3 [Got] 3\n"
 }
]
```

Con estas pruebas podemos notar como un aprendizaje pequeño, tal como se
mencionó teóricamente en un principio, es lo más adecuado para generar un
aprendizaje certero. Si bien nuestra cantidad de ciclos de entrenamiento no fue
muy alta, vease como 400 un número bajo, podemos notar como se va formando la
convergencia de la función en numeros cercanos al 0.
