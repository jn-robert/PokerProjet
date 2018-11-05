<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;

use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserFixtures extends Fixture
{
    // ...https://symfony.com/doc/current/bundles/DoctrineFixturesBundle/index.html
    private $encoder;
    public function __construct(UserPasswordEncoderInterface $encoder)
    {
        $this->encoder = $encoder;
    }


    public function load(ObjectManager $manager)
    {

        echo " \n\nles utilisateurs : \n";

        $admin = new User();
        $password = $this->encoder->encodePassword($admin, 'admin');
        $admin->setPassword($password);
        $admin->setRoles('ROLE_ADMIN')
            ->setUsername('admin')->setEmail('admin@example.com')->setIsActive('1');
        $manager->persist($admin);
        echo $admin."\n";

        $user = new User();
        $password = $this->encoder->encodePassword($user, 'user');
        $user->setPassword($password);
        $user->setRoles('ROLE_USER')->setUsername('user')
            ->setEmail('user@example.com')->setIsActive('1');
        $manager->persist($user);
        echo $user."\n";


        $manager->flush();
    }
}