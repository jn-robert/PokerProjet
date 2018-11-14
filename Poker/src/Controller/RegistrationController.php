<?php
// src/Controller/RegistrationController.php
namespace App\Controller;

use App\Form\UserType;
use App\Entity\User;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Bridge\Doctrine\RegistryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Twig\Environment;

class RegistrationController extends AbstractController
{
    /**
     * @Route("/register", name="user_registration")
     */
    public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder, \Swift_Mailer $mailer)
    {
        // 1) build the form
        $user = new User();
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            // 3) Encode the password (you could also do this via Doctrine listener)
            $password = $passwordEncoder->encodePassword($user, $user->getPlainPassword());
            $user->setPassword($user->getEmail());
            $user->setTemp($password);
            $user->setIsActive(false);
            $cle=md5(microtime(TRUE)*100000);
            $user->setCle($cle);

            // 4) save the User!
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            // ... do any other work - like sending them an email, etc
            // maybe set a "flash" success message for the user

            $message = (new \Swift_Message('Hello Email'))
                ->setFrom('projetpoker@gmail.com')
                ->setTo($user->getEmail())
                ->setBody(
                    $this->renderView(
                    // templates/emails/registration.html.twig
                        'emails/registration.html.twig',
                        array('name' => $user->getUsername(), 'log'=>$user->getUsername(),'cle'=>$cle)
                    ),
                    'text/html'
                )
            ;

            $mailer->send($message);

            return $this->redirectToRoute('user.index');
        }

        return $this->render(
            'registration/register.html.twig',
            array('form' => $form->createView())
        );
    }

    /**
     * @Route("/loginUser/{log}/{cle}", name="loginUser", methods={"GET"})
     */
    public function loginUser(Request $request, Environment $twig, RegistryInterface $doctrine, ObjectManager $manager, $log, $cle, UserPasswordEncoderInterface $passwordEncoder){
        $login = $log;
        $user = $doctrine->getRepository(User::class)->findOneBy(['username'=>$login]);
        if ($user->getIsActive()==1){
            $message="Compte déja activé, vous pouvez vous connecter maintenant";
        }else {
            if ($user->getCle() == $cle) {
                $user->setPassword($user->getTemp());
                $user->setTemp(null);
                $user->setIsActive(true);
                $user->setRoles('ROLE_USER');
                $manager->persist($user);
                $manager->flush();

                $message="Votre compte a bien été activé, vous pouvez vous connecter maintenant";
            }else{
                $message="Erreur, impossible d'activer votre compte";
            }
        }

        return new Response($twig->render('emails/validEmail.html.twig',['message'=>$message]));
    }
}